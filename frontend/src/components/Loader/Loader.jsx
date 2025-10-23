import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoader } from "../../context/LoaderContext";

const Loader = () => {
  const { visible, progress, message } = useLoader();
  const [internalProgress, setInternalProgress] = useState(0);

  // Smooth animation for progress
  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setInternalProgress((prev) =>
          prev < 95 ? prev + Math.random() * 3 : prev
        );
      }, 300);
      return () => clearInterval(interval);
    } else {
      setInternalProgress(0);
    }
  }, [visible]);

  useEffect(() => {
    if (progress > 0) setInternalProgress(progress);
  }, [progress]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-80 bg-gray-800 rounded-2xl p-6 shadow-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <p className="text-lg mb-3 text-center">{message}</p>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-blue-500 h-3"
                style={{ width: `${internalProgress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${internalProgress}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>
            <p className="text-center mt-2 text-sm">
              {Math.floor(internalProgress)}%
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
