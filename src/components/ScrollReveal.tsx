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

export default function ScrollReveal(props: ScrollRevealProps) {
  const {
    children,
    variant = "fade-up",
    delay = 0,
    duration = 0.6,
    staggerChildren,
    once = true,
    margin = "-20px",
    className = "",
    ...restProps
  } = props;

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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={className}
      {...restProps}
    >
      {children}
    </motion.div>
  );
}

// Sub-component for children inside a staggered container
export function ScrollRevealItem(props: {
  children: React.ReactNode;
  variant?: AnimationVariant;
  className?: string;
} & HTMLMotionProps<"div">) {
  const {
    children,
    variant = "fade-up",
    className = "",
    ...restProps
  } = props;

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
    <motion.div variants={itemVariants} className={className} {...restProps}>
      {children}
    </motion.div>
  );
}
