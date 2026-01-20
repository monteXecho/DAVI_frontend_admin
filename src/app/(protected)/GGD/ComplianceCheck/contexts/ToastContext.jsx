import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (data) => {
    const id = Math.random() * Date.now();
    setToasts([...toasts, { ...data, id }]);
  };

  const removeToast = (data) => {
    setToasts(toasts.filter((item) => item.id !== data));
  };

  return (
    <ToastContext.Provider value={{ toasts, setToasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
