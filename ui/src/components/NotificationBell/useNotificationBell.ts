import { useEffect, useRef, useState } from "react";

/**
 * Open/close + click-outside-to-close state for the notification dropdown, mirroring the
 * useAddToListMenu pattern used for the "Add to list" menu.
 */
export function useNotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
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
