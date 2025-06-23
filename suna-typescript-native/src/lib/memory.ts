import { Mem0 } from '@mem0/mcp-server';

let mem0: Mem0;

function getMem0Client(): Mem0 {
  if (!mem0) {
    mem0 = new Mem0({
      apiKey: process.env.MEM0_API_KEY,
    });
  }
  return mem0;
}

export async function addMemory(content: string, userId: string): Promise<any> {
  const client = getMem0Client();
  const result = await client.add({ content, userId });
  return result;
}

export async function searchMemory(query: string, userId: string): Promise<any> {
  const client = getMem0Client();
  const result = await client.search({ query, userId });
  return result;
}
