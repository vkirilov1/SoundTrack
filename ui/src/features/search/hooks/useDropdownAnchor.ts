import { useEffect, useRef, useState } from "react";

/**
 * Tracks a container's bounding rect (for positioning a portaled dropdown
 * under it) and closes it on an outside click or Escape while `open`.
 */
export function useDropdownAnchor(open: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const insideContainer = containerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideContainer && !insideDropdown) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    function updateRect() {
      if (containerRef.current) {
        setAnchorRect(containerRef.current.getBoundingClientRect());
      }
    }

    const raf = requestAnimationFrame(updateRect);
    window.addEventListener("resize", updateRect);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  return { containerRef, dropdownRef, anchorRect };
}
