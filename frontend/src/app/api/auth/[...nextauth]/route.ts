import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const nextAuthOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch("http://localhost:7000/api/auth/loginU", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        if (!res.ok) return null;

        const data = await res.json();

        return {
          id: data.user.id,
          nome: data.user.nome,
          cpf: data.user.cpf,
          nascimento: data.user.nascimento,
          fone: data.user.fone,
          email: data.user.email,
          avatar: data.user.avatar,
          role: data.user.role,
          crm: data.user.crm,
          especialidade: data.user.especialidade,
          setor: data.user.setor,
          medico: data.user.medico,
          atendente: data.user.atendente,
          accessToken: data.accessToken,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nome = user.nome;
        token.cpf = user.cpf;
        token.nascimento = user.nascimento;
        token.fone = user.fone;
        token.email = user.email;
        token.avatar = user.avatar;
        token.role = user.role;
        token.crm = user.crm;
        token.especialidade = user.especialidade;
        token.setor = user.setor;
        token.medico = user.medico;
        token.atendente = user.atendente;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        nome: token.nome as string,
        cpf: token.cpf as string,
        nascimento: token.nascimento as string,
        fone: token.fone as string,
        email: token.email as string,
        avatar: token.avatar as string | null,
        role: token.role as "ADMIN" | "MEDICO" | "ATENDENTE",
        crm: token.crm as string | undefined,
        especialidade: token.especialidade as string | undefined,
        setor: token.setor as string | undefined,
        medico: token.medico as string[] | null,
        atendente: token.atendente as string[] | null,
      };

      session.accessToken = token.accessToken as string;

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
