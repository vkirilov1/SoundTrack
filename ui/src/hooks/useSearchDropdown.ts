import { useEffect, useRef, useState } from "react";

/**
 * Shared open/close + click-outside-to-close + debounced-search state for a search dropdown menu.
 * `searchFn` should be a stable reference (a plain exported API function, not an inline arrow) so
 * this doesn't reset its debounce on every render.
 */
export function useSearchDropdown<T>(
  searchFn: (query: string) => Promise<T[]>,
) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [searching, setSearching] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const trimmed = query.trim();

    const timeout = setTimeout(() => {
      if (!trimmed) {
        setResults([]);
        return;
      }

      setSearching(true);
      searchFn(trimmed)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, menuOpen, searchFn]);

  function toggleMenu() {
    setMenuOpen((open) => !open);
  }

  function closeMenu() {
    setMenuOpen(false);
    setQuery("");
    setResults([]);
  }

  return {
    menuOpen,
    query,
    setQuery,
    results,
    searching,
    menuRef,
    toggleMenu,
    closeMenu,
  };
}
