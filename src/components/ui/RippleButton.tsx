"use client";

import { useCallback, useRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

type RippleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  function RippleButton({ children, className, onClick, type = "button", ...props }, ref) {
    const btnRef = useRef<HTMLButtonElement>(null);

    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        btnRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref && typeof ref === "object" && "current" in ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }
      },
      [ref],
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const btn = btnRef.current;
        if (btn) {
          const rect = btn.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height) * 2.5;
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          const ripple = document.createElement("span");
          ripple.setAttribute("data-ripple", "");
          ripple.style.cssText = [
            "position:absolute",
            `width:${size}px`,
            `height:${size}px`,
            `left:${x}px`,
            `top:${y}px`,
            "border-radius:50%",
            "background:rgba(255,255,255,0.42)",
            "box-shadow:0 0 24px rgba(255,255,255,0.35)",
            "will-change:transform,opacity",
            "z-index:40",
            "pointer-events:none",
            "animation:ripple-expand 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
          ].join(";");
          btn.appendChild(ripple);
          ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
        }
        onClick?.(e);
      },
      [onClick],
    );

    return (
      <button
        ref={setRefs}
        type={type}
        className={cn("relative isolate overflow-hidden", className)}
        {...props}
        onClick={handleClick}
      >
        <span className="relative z-10 contents">{children}</span>
      </button>
    );
  },
);

RippleButton.displayName = "RippleButton";
