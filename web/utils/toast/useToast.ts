import { ToastContext } from "@/utils/toast/toastContext";
import { useContext } from "react";

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { open } = context;

  return { open };
};
