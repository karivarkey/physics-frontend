import { easeInOut, motion } from "framer-motion";
import type { PropsWithChildren } from "react";

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.99,
  },
  in: {
    opacity: 1,
    scale: 1,
  },
  out: {
    opacity: 0,
    scale: 0.99,
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: easeInOut,
  duration: 0.2,
};

export default function PageTransition({ children }: PropsWithChildren) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}