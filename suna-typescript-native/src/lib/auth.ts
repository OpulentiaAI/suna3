import { currentUser } from "@clerk/nextjs/server";

// This is a placeholder for the upcoming agent authentication feature from Clerk.
// For now, it returns a mock agent token.
export async function currentAgent(): Promise<string> {
  console.log("Mocking agent authentication...");
  return "mock-agent-token";
}

export { currentUser };
