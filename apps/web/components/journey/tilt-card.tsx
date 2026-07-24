"use client";

import { motion } from "framer-motion";
import { tiltIn, useMotionVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Scroll-reveals a card with a subtle 3D tilt (or a plain fade under reduced-motion). */
export function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const variants = useMotionVariants(tiltIn);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      style={{ transformPerspective: 800 }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
