"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        // Optional: you can apply default shadcn classes or Tailwind styling here
        className: "bg-white border rounded-md shadow-xl",
        duration: 4000,
      }}
    />
  );
}
