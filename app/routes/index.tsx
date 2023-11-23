import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
  useClerk,
} from "@clerk/remix";
import { getAuth, rootAuthLoader } from "@clerk/remix/ssr.server";
import { Button, Title } from "@mantine/core";
import { PrismaClient } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { OpenAI } from "openai";
import { findAllTask } from "~/datasource/prisma/task";
import { NormalPrompt } from "~/util/prompt";

const prisma = new PrismaClient();

export const loader: LoaderFunction = (args) => {
  return rootAuthLoader(args, async ({ request }) => {
    const { userId } = request.auth;

    const tasks = userId ? await findAllTask(userId) : [];

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
  // TODO:データの有無で画面を切り替えようと思った
  // const data = useLoaderData<typeof loader>();
  const { signOut } = useClerk();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const title = actionData ? actionData.response.title : "";
  const ingredients = actionData ? actionData.response.ingredients : [];
  const instructions = actionData ? actionData.response.instructions : "";

  return (
    <>
      <SignedIn>
        <div className="container">
          <div className="userButton">
            <UserButton />
          </div>
          <Button
            onClick={() => signOut()}
            variant="light"
            radius="xl"
            className="logout"
          >
            sign out
          </Button>
        </div>

        <Form method="post" className="generateBtn">
          {navigation.state === "submitting" ? (
            <Button
              type="submit"
              name="action"
              value="generate"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 245 }}
              size="lg"
              radius="xl"
              disabled
            >
              Loading...
            </Button>
          ) : (
            <Button
              type="submit"
              name="action"
              value="generate"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 245 }}
              size="lg"
              radius="xl"
            >
              generate menu
            </Button>
          )}
        </Form>

        {actionData ? (
          <div className="menuContainer">
            <p className="title">~料理名~</p>
            <Title order={3} size="h1">
              {title}
            </Title>

            <div className="ingredientsTitle">
              <p className="title">~材料~</p>
              <Link to={"/List"} target="_blank">
                LIST
              </Link>
            </div>
            <ul>
              {ingredients.map((ingredient: string) => {
                return <li key={ingredient}>{ingredient}</li>;
              })}
            </ul>

            <p className="title">~作り方~</p>
            <p
              dangerouslySetInnerHTML={{
                __html: instructions.replace(/\n/g, "<br>"),
              }}
            ></p>
          </div>
        ) : null}
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
