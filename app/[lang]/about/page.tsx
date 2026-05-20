import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/locale";

type Props = { params: Promise<{ lang: string }> };

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  redirect(`/${lang}#about`);
}
