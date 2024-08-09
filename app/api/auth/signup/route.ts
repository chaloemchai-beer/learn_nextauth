import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: any) {
  try {
    const { email, password, name } = await request.json();
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },  
    });
    return Response.json({
      message: "create user ok hafu",
      data: {
        newUser,
      },
    });
  } catch (error) {
    return Response.json({ error: "User could not be created" });
  }
}
