// app/auth.ts

import { NextAuthOptions, DefaultSession, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient, User as PrismaUser } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters"
import GoogleProvider from 'next-auth/providers/google'

const prisma = new PrismaClient();

// Extend the built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string | null;
    } & DefaultSession["user"]
  }

  // Modify this interface to match your Prisma User model
  interface User extends PrismaUser {
    id: string; // Change this to string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@doe.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && user.password && (await bcrypt.compare(credentials.password, user.password))) {
          return {
            ...user,
            id: user.id.toString(), // Convert id to string
          };
        } else {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile): User {
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          image: profile.picture,
          role: 'user', // Provide a default role
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          password: null,
        } as User;
      },
    }),
  ],
  
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? null;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | null | undefined;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
    redirect: async ({ baseUrl }) => {
      return `${baseUrl}/profile`;
    },
  },
};