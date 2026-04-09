import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // 👈 essencial pro refresh_token
});

// 🔐 Token em memória
let accessToken: string | null = null;

// 👉 Setter pra usar após login
export const setAccessToken = (token: string) => {
  accessToken = token;
};

// 👉 Controle de refresh simultâneo
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// 🔹 Interceptor de REQUEST
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 🔹 Interceptor de RESPONSE (REFRESH AQUI)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // 👉 Se não for 401, só retorna erro
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // 👉 Evita loop infinito
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // 👉 Se já está fazendo refresh, fila as requests
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject: (err: any) => {
            reject(err);
          },
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // 🔄 chama refresh (cookie vai automaticamente)
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = res.data.accessToken;

      // 💾 atualiza token em memória
      setAccessToken(newToken);

      // 🔄 libera fila
      processQueue(null, newToken);

      // 🔁 refaz request original
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);

    } catch (err) {
      processQueue(err, null);

      // 🚪 fallback: logout
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }

      return Promise.reject(err);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;