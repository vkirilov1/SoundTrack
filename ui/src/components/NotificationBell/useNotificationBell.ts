import { useEffect, useRef, useState } from "react";

export function useNotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const insideModal =
        target instanceof Element &&
        target.closest("[data-modal-root]") != null;
      if (!panelRef.current?.contains(target) && !insideModal) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function toggle() {
    setOpen((prev) => !prev);
  }

  return { open, panelRef, toggle };
}
