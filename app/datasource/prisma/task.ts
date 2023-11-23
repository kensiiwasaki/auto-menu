import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findAllTask = async (userId: string) => {
  return await prisma.task.findMany({ where: { userId } });
};
