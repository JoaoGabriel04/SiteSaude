"use client";

import { useEffect, useState } from "react";
import { registerToast } from "./toastManager";
import ToastContainer from "./ToastContainer";


export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: string }[]>([]);

  function removeToast(id: string) {
    setToasts((prev: { id: string; message: string; type: string }[] ) =>
      prev.filter((t: { id: string }) => t.id !== id)
    );
  }

  useEffect(() => {
    registerToast((message: string, type: string) => {
      const id = Date.now();

      setToasts((prev: { id: string; message: string; type: string }[]) => [
        ...prev,
        { id: id.toString(), message, type }
      ]);

      setTimeout(() => {
        removeToast(id.toString());
      }, 3000);
    });
  }, []);

  return (
    <>
      {children}
      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
      />
    </>
  );
}