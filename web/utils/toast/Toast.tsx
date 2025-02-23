"use client";

import { ToastContext } from "@/utils/toast/toastContext";
import { useContext } from "react";

export function Toast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("ToastContext must be used within a ToastProvider");
  }
  const { message, isOpen } = context;

  return isOpen ? (
    <div className="flex justify-center p-4 bg-gray-800 border-2 border-red-500 text-white rounded-lg shadow-lg">
      {message}
    </div>
  ) : null;
}
