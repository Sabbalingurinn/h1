// services/userService.ts
import { PrismaClient } from '@prisma/client';


import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 11);

export const findUserByUsername = async (username: string) => {
  return prisma.user.findUnique({ where: { username } });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id: number) => {
  return prisma.user.findUnique({ where: { id } });
};

export const createUser = async (username: string, email: string, password: string, admin = false) => {
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return prisma.user.create({
    data: { username, email, password: hashedPassword, admin },
  });
};

export const comparePasswords = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
