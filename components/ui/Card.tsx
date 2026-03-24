"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type ContentCardProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  index?: number;
};

export function ContentCard({
  title,
  description,
  href,
  ctaLabel,
  index = 0,
}: ContentCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: "easeOut", delay: index * 0.06 }}
      className="rounded-2xl border border-apex-border p-6 bg-apex-card"
      style={{ boxShadow: "0 20px 44px rgba(0, 0, 0, 0.26)" }}
    >
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <p className="text-apex-muted mb-4">{description}</p>
      <Link href={href} className="text-apex-primary font-medium">
        {ctaLabel}
      </Link>
    </motion.article>
  );
}
