"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { fadeInUp, staggerChildren, useMotionVariants } from "@/lib/motion";

export interface TestimonyCardData {
  id: string;
  authorName: string;
  body: string;
}

/** Client wrapper: subtle stagger-in scroll reveal for testimony cards, data fetched server-side by the parent. */
export function TestimonyReveal({ testimonies }: { testimonies: TestimonyCardData[] }) {
  const containerVariants = useMotionVariants(staggerChildren);
  const cardVariants = useMotionVariants(fadeInUp);

  return (
    <motion.div
      className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {testimonies.map((t) => (
        <motion.figure
          key={t.id}
          variants={cardVariants}
          className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          <Quote size={22} className="text-brand-400" />
          <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-current/85">
            &ldquo;{t.body}&rdquo;
          </blockquote>
          <figcaption className="mt-4 text-sm font-semibold text-brand-700 dark:text-brand-300">
            &ndash; {t.authorName}
          </figcaption>
        </motion.figure>
      ))}
    </motion.div>
  );
}
