"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }) {
  const pathname = usePathname();

  // Next.js App Router has issues with AnimatePresence mode="wait" holding up the React tree.
  // Using just motion.div with a dynamic key ensures the entry animation plays smoothly
  // on every route change without freezing the navigation links.
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
}
