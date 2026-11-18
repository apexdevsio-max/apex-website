import { isLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locale";
import { buildLlmsTxt, llmsResponse } from "@/lib/seo/llms";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) return new Response("Not found", { status: 404 });
  return llmsResponse(await buildLlmsTxt(lang));
}
