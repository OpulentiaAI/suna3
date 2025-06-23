import { Stagehand, type Page } from "@browserbasehq/stagehand";
import { z } from "zod";

export async function browse(
  url: string,
  prompt: string,
): Promise<{ content: string }> {
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
  });

  try {
    await stagehand.init();
    const page: Page = stagehand.page;
    await page.goto(url);
    const content = await page.extract({
      instruction: prompt,
      schema: z.object({ content: z.string() }),
    });
    return content;
  } finally {
    await stagehand.close();
  }
}
