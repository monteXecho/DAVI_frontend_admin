import React from "react";
import { useToast } from "../../contexts/ToastContext";
import Toast from "./Toast";

const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex flex-col">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            duration={toast.duration}
            type={toast.type}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;