"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
}: ModalProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // controla entrada
  useEffect(() => {
    if (isOpen && boxRef.current && overlayRef.current) {
      gsap.fromTo(
        boxRef.current,
        { opacity: 0, y: -50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }
      );

      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4 }
      );
    }
  }, [isOpen]);

  function handleClose() {
    if (!boxRef.current || !overlayRef.current) return;

    gsap.to(boxRef.current, {
      opacity: 0,
      y: 50,
      scale: 0.9,
      duration: 0.3,
      ease: "power3.in",
    });

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: onClose,
    });
  }

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "w-72",
    md: "w-96",
    lg: "w-[32rem]",
    xl: "w-[40rem]",
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Modal */}
      <div
        ref={boxRef}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        ${sizeClasses[size]} bg-white rounded-md shadow-lg z-10`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold font-poppins">{title}</h2>
          <X className="cursor-pointer" onClick={handleClose} />
        </div>

        <div className="p-4">{children}</div>
      </div>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
    </div>
  );
}