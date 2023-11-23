import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findUserAllTask = async (userId: string) => {
  return await prisma.task.findMany({ where: { userId } });
};

export const deleteUserAllTask = async (userId: string) => {
  return await prisma.task.deleteMany({
    where: {
      userId: userId,
    },
  });
};
