// components/Logo.tsx
import { easeInOut, motion } from "framer-motion";
import { Atom } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();

  // Parent container with stagger
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // delay between child animations
      },
    },
  };

  // Child fade+slide animation
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, easeInOut} },
  };

  return (
    <motion.button
      onClick={() => navigate("/home")}
      className="flex items-center justify-start gap-2.5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Icon */}
      <motion.div variants={item}>
        <Atom className="h-7 w-7 text-blue-500" />
      </motion.div>

      {/* Text block */}
      <motion.div
        className="flex flex-col items-start"
        variants={container} // nested stagger for title & subtitle
        initial="hidden"
        animate="show"
      >
        <motion.span
          variants={item}
          className="text-xl font-bold tracking-tighter bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
        >
          RSET LABS
        </motion.span>
        <motion.span
          variants={item}
          className="text-xs text-muted-foreground -mt-1"
        >
          Simulating Tomorrow&apos;s Breakthroughs
        </motion.span>
      </motion.div>
    </motion.button>
  );
};

export default Logo;
