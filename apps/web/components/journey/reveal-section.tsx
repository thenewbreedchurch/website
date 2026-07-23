"use client";

import { motion } from "framer-motion";
import { fadeInUp, useMotionVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Scroll-reveals its children once, using fadeInUp (or a plain fade under reduced-motion). */
export function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const variants = useMotionVariants(fadeInUp);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
