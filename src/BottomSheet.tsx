import React, { useEffect, useState } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isOpen) {
      const scrollY = window.scrollY;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
    } else {
      const scrollY = document.body.style.top;

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }

      timer = setTimeout(() => setShouldRender(false), 260);
    }

    return () => {
      clearTimeout(timer);
      const scrollY = document.body.style.top;
      if (scrollY) {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`sheet-backdrop ${isOpen ? "open" : "closing"}`}
      onClick={onClose}
    >
      <div
        className={`bottom-sheet ${isOpen ? "open" : "closing"}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="sheet-close"
            onClick={onClose}
            aria-label="Закрити"
          >
            ✕
          </button>
        </div>
        <div className="sheet-content">{children}</div>
      </div>
    </div>
  );
}
