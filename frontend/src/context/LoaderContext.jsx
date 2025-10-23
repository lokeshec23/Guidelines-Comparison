import { createContext, useContext, useState, useCallback } from "react";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const showLoader = useCallback(() => setVisible(true), []);
  const hideLoader = useCallback(() => setVisible(false), []);

  const updateProgress = useCallback((val) => {
    setProgress(Math.min(Math.max(val, 0), 100));
  }, []);

  const updateMessage = useCallback((msg) => {
    setMessage(msg);
  }, []);

  return (
    <LoaderContext.Provider
      value={{
        visible,
        progress,
        message,
        showLoader,
        hideLoader,
        updateProgress,
        updateMessage,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
