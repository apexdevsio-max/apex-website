/** Inline JSON-LD. `<` is escaped so a value can never close the script element. */
export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\u003c") }}
    />
  );
}
