import React from "react";
import { motion, HTMLMotionProps } from "motion/react";

type AnimationVariant = "fade" | "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  once?: boolean;
  margin?: string;
  className?: string;
}

export default function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.6,
  staggerChildren,
  once = true,
  margin = "-20px",
  className = "",
  ...props
}: ScrollRevealProps) {
  // Define animation presets
  const variants = {
    hidden: {
      opacity: 0,
      y: variant === "fade-up" ? 40 : variant === "fade-down" ? -40 : 0,
      x: variant === "fade-left" ? 40 : variant === "fade-right" ? -40 : 0,
      scale: variant === "zoom" ? 0.94 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
        mass: 0.8,
        duration: duration,
        delay: delay,
        when: "beforeChildren",
        staggerChildren: staggerChildren,
      },
    },
  };

  // If we want a staggered container, we should let children have their own variants
  // This standard Framer Motion behavior works if the parent is a motion container
  const isContainer = typeof staggerChildren === "number" && staggerChildren > 0;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Sub-component for children inside a staggered container
export function ScrollRevealItem({
  children,
  variant = "fade-up",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: AnimationVariant;
  className?: string;
} & HTMLMotionProps<"div">) {
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: variant === "fade-up" ? 30 : variant === "fade-down" ? -30 : 0,
      x: variant === "fade-left" ? 30 : variant === "fade-right" ? -30 : 0,
      scale: variant === "zoom" ? 0.95 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}
