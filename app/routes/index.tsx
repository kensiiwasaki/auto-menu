import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
  useClerk,
} from "@clerk/remix";
import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import { Button } from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { OpenAI } from "openai";
import { NormalPrompt } from "~/util/prompt";

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

export const action: ActionFunction = async (args) => {
  const { userId } = await getAuth(args);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const gptResponse = await openai.chat.completions.create({
    messages: [{ role: "system", content: NormalPrompt }],
    model: "gpt-3.5-turbo",
  });
  const content = gptResponse.choices[0].message.content;
  const jsonObject = JSON.parse(content ? content : "");

  await prisma.task.deleteMany({
    where: {
      userId: userId ? userId : "",
    },
  });

  await Promise.all(
    jsonObject.ingredients.map(async (ingredient: string) => {
      return prisma.task.create({
        data: {
          content: ingredient,
          completed: false,
          userId: userId ? userId : "",
        },
      });
    })
  );

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
          <Button type="submit" name="action" value="generate">
            generate menu
          </Button>
        </Form>
        <p>{title}</p>
        <ul>
          {ingredients.map((ingredient: string) => {
            return <li key={ingredient}>{ingredient}</li>;
          })}
        </ul>
        <p
          dangerouslySetInnerHTML={{
            __html: instructions.replace(/\n/g, "<br>"),
          }}
        ></p>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}
