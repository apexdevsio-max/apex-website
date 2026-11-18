import { buildLlmsTxt, llmsResponse } from "@/lib/seo/llms";

export const dynamic = "force-static";

export async function GET() {
  return llmsResponse(await buildLlmsTxt("en"));
}
