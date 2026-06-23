import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { isDbDisabled } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: isDbDisabled ? undefined : PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
  },
  providers: isDbDisabled
    ? []
    : [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID ?? "",
          clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
          allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
          credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
          },
          async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null;

            const email = credentials.email as string;
            const password = credentials.password as string;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user?.passwordHash) return null;

            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) return null;

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            };
          },
        }),
      ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
