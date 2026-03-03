export type ToastListener = (message: string, type: string) => void;

let listener: ToastListener | null = null;

export function registerToast(fn: ToastListener) {
  listener = fn;
}

function emit(message: string, type: string) {
  if (listener) {
    listener(message, type);
  }
}

export const toast = {
  success(msg: string) {
    emit(msg, "success");
  },

  error(msg: string) {
    emit(msg, "error");
  },

  warning(msg: string) {
    emit(msg, "warning");
  },

  info(msg: string) {
    emit(msg, "info");
  }
};