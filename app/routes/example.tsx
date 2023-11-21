import { useAuth } from "@clerk/remix";

export default function Example() {
  const { isLoaded, userId, sessionId } = useAuth();

  // In case the user signs out while on the page.
  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <div>
      Hello, {userId} your current active session is {sessionId}
    </div>
  );
}
