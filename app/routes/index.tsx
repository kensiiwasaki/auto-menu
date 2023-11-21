import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
  useClerk,
} from "@clerk/remix";

export default function Index() {
  const { signOut } = useClerk();
  return (
    <div>
      <SignedIn>
        <h1>Index route</h1>
        <p>You are signed in!</p>
        <UserButton />
        <button onClick={() => signOut()}>サインアウト</button>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}
