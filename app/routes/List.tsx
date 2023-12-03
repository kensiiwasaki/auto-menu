import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { Title } from "@mantine/core";
import type { Task } from "@prisma/client";
import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import {
  findUniqueUserTask,
  findUserAllTask,
  updateUserTask,
} from "~/datasource/prisma/task";

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args, async ({ request }) => {
    const { userId } = request.auth;

    const tasks = userId ? await findUserAllTask(userId) : [];

    return json({ tasks });
  });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const taskId = Number(form.get("taskId"));
  const task = await findUniqueUserTask(taskId ? taskId : -1);
  if (task) {
    await updateUserTask(taskId, task);
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
        <Form key={task.id} method="POST">
          <p
            className={task.completed ? "completed" : ""}
            onClick={() => toggleTaskCompletion(task.id)}
          >
            {task.content}
          </p>
        </Form>
      ))}
    </div>
  );
}
