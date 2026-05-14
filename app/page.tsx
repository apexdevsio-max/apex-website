import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage(): Promise<never> {
  const localeHeader = (await headers()).get("x-locale");
  const lang = localeHeader === "ar" ? "ar" : "en";
  redirect(`/${lang}`);
}
