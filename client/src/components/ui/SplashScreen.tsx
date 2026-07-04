import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoMark } from "@/components/brand/Logo";

// Module-level flag (not sessionStorage/localStorage) — resets on a full
// page reload, but never re-shows on client-side route changes or
// back/forward navigation within the same session.
let hasShownSplash = false;

const SPLASH_VISIBLE_MS = 1700;
const MARK_SIZE = 96;

export default function SplashScreen({
  onFinished,
}: {
  onFinished: () => void;
}) {
  const [visible, setVisible] = useState(!hasShownSplash);

  useEffect(() => {
    if (!visible) {
      onFinished();
      return;
    }
    hasShownSplash = true;
    const timeout = setTimeout(() => setVisible(false), SPLASH_VISIBLE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence onExitComplete={onFinished}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ahmedify-bg"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <div
              className="relative overflow-hidden"
              style={{
                width: MARK_SIZE,
                height: MARK_SIZE,
                borderRadius: MARK_SIZE * 0.26,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              >
                <LogoMark size={MARK_SIZE} />
              </motion.div>
              <motion.div
                className="absolute inset-0 bg-white/40"
                initial={{ x: "-120%" }}
                animate={{ x: "120%" }}
                transition={{ duration: 0.8, delay: 0.35, ease: "easeInOut" }}
                style={{ mixBlendMode: "overlay" }}
              />
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-2xl font-bold tracking-tight text-ahmedify-text"
            >
              Mus<span className="text-ahmedify-green">ify</span>
            </motion.h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
