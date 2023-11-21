import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
  useClerk,
} from "@clerk/remix";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { Button } from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { OpenAI } from "openai";

const prisma = new PrismaClient();

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args, async ({ request }) => {
    const { userId } = request.auth;

    const tasks = userId
      ? await prisma.task.findMany({ where: { userId } })
      : [];

    return json({ tasks });
  });
};

export const action = async () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const prompt = `
  今日の夜ご飯の主菜を考えてください
  {
    "title": "string",
    "ingredients": [],
    "instructions": "string"
  }
  のJSON形式で返してください
  `;
  const gptResponse = await openai.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "gpt-3.5-turbo",
  });
  const content = gptResponse.choices[0].message.content;
  const jsonObject = JSON.parse(content ? content : "");

  return json({ response: jsonObject });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const { signOut } = useClerk();
  const actionData = useActionData<typeof action>();

  const title = actionData ? actionData.response.title : "Waiting...";
  const ingredients = actionData ? actionData.response.ingredients : [];
  const instructions = actionData ? actionData.response.instructions : "";

  console.log(data);

  return (
    <div>
      <SignedIn>
        <h1>Index route</h1>
        <p>You are signed in!</p>
        <UserButton />
        <Button onClick={() => signOut()}>サインアウト</Button>

        <Form method="post">
          <Button type="submit">プロンプト</Button>
        </Form>
        <p>{title}</p>
        <ul>
          {ingredients.map((ingredient: string) => {
            return <li key={ingredient}>{ingredient}</li>;
          })}
        </ul>
        <p>{instructions}</p>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}
