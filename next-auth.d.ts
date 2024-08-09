import NextAuth, { DefaultSession } from "next-auth";
import { PrismaClient, User as PrismaUser } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string | null;
    } & DefaultSession["user"]
  }

  interface User extends PrismaUser {}
}