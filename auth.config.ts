import type { NextAuthConfig } from "next-auth";

// Configuração compatível com Edge Runtime (sem bcryptjs)
// Usada apenas pelo middleware para verificar a sessão
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // providers com bcrypt ficam em auth.ts
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
};
