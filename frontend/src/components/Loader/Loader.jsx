import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoader } from "../../context/LoaderContext";

const Loader = () => {
  const { visible, progress, message } = useLoader();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl w-[400px] border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Animated Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <svg
                  className="w-16 h-16 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </motion.div>
            </div>

            {/* Progress Percentage */}
            <div className="text-center mb-4">
              <motion.h2
                className="text-4xl font-bold text-gray-800 dark:text-white"
                key={progress}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Math.floor(progress)}%
              </motion.h2>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                <motion.div
                  className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Status Message */}
            <motion.div
              className="text-center"
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {message || "Processing..."}
              </p>
            </motion.div>

            {/* Footer Note */}
            <motion.div
              className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                ⏳ Please wait, do not close this window
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
