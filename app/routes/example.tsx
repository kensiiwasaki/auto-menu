import { useAuth } from "@clerk/remix";

export default function Example() {
  const { isLoaded, userId, sessionId } = useAuth();

  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <div>
      Hello, {userId} your current active session is {sessionId}
    </div>
  );
}
