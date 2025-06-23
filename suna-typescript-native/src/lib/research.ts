import Firecrawl from '@mendable/firecrawl-js';

let firecrawl: Firecrawl;

export function getFirecrawlClient(): Firecrawl {
  if (!firecrawl) {
    firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY,
    });
  }
  return firecrawl;
}
