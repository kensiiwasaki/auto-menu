import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { Title } from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

const prisma = new PrismaClient();

type Task = {
  id: number;
  content: string;
  completed: boolean;
  createdAt: Date;
  userId: string;
};

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args, async ({ request }) => {
    const { userId } = request.auth;

    const tasks = userId
      ? await prisma.task.findMany({ where: { userId } })
      : [];

    return json({ tasks });
  });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const taskId = form.get("taskId");
  const task = await prisma.task.findUnique({ where: { id: Number(taskId) } });
  if (task) {
    await prisma.task.update({
      where: { id: Number(taskId) },
      data: { completed: !task.completed },
    });
  }
  return json({ status: "success" });
};

export default function List() {
  const { tasks } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const toggleTaskCompletion = async (taskId: number) => {
    const formData = new FormData();
    formData.append("taskId", String(taskId));

    await fetcher.submit(formData, {
      method: "POST",
    });
  };

  return (
    <div className="listContainer">
      <Title order={3} size="h1" className="listTitle">
        LIST
      </Title>
      {tasks.map((task: Task) => (
        <div key={task.id}>
          <p
            className={task.completed ? "completed" : ""}
            onClick={() => toggleTaskCompletion(task.id)}
          >
            {task.content}
          </p>
        </div>
      ))}
    </div>
  );
}
