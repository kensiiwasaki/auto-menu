import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
  useClerk,
} from "@clerk/remix";
import { Button } from "@mantine/core";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { OpenAI } from "openai";

export const action = async () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const prompt = "こんにちは";
  const gptResponse = await openai.chat.completions.create({
    messages: [{ role: "system", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  return json({ response: gptResponse });
};

export default function Index() {
  const { signOut } = useClerk();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <SignedIn>
        <h1>Index route</h1>
        <p>You are signed in!</p>
        <UserButton />
        <Button onClick={() => signOut()}>サインアウト</Button>

        <Form method="post">
          <button type="submit">プロンプト</button>
        </Form>
        <p>
          {actionData
            ? actionData.response.choices[0].message.content
            : "Waiting..."}
        </p>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}
