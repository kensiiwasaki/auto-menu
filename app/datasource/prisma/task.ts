import type { Task } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findUserAllTask = async (userId: string) => {
  return await prisma.task.findMany({ where: { userId } });
};

export const findUniqueUserTask = async (taskId: number) => {
  return await prisma.task.findUnique({ where: { id: Number(taskId) } });
};

export const updateUserTask = async (taskId: number, task: Task) => {
  await prisma.task.update({
    where: { id: taskId },
    data: { completed: !task.completed },
  });
};

export const deleteUserAllTask = async (userId: string) => {
  return await prisma.task.deleteMany({
    where: {
      userId: userId,
    },
  });
};

export const createUserTask = async (ingredient: string, userId: string) => {
  return prisma.task.create({
    data: {
      content: ingredient,
      completed: false,
      userId: userId,
    },
  });
};
