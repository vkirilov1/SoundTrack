import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  useDebouncedSearch,
  MIN_QUERY_LENGTH,
} from "../hooks/useDebouncedSearch";
import type { SearchMode } from "../hooks/useDebouncedSearch";
import { useDropdownAnchor } from "../hooks/useDropdownAnchor";
import styles from "./SearchBar.module.css";
import SearchResultRow from "./SearchResultRow";
import UserResultRow from "./UserResultRow";

function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("music");

  const inputRef = useRef<HTMLInputElement>(null);

  const closeDropdown = useCallback(() => setOpen(false), []);
  const { containerRef, dropdownRef, anchorRect } = useDropdownAnchor(
    open,
    closeDropdown,
  );
  const { musicResults, userResults, loading, reset } = useDebouncedSearch(
    query,
    mode,
  );

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleClose() {
    setOpen(false);
    setQuery("");
    setMode("music");
    reset();
  }

  const trimmedQuery = query.trim();
  const showHint = trimmedQuery.length < MIN_QUERY_LENGTH;
  const hasMusicResults =
    musicResults.albums.length > 0 || musicResults.artists.length > 0;

  return (
    <div
      className={
        open ? `${styles.container} ${styles.containerOpen}` : styles.container
      }
      ref={containerRef}
    >
      {!open ? (
        <button
          type="button"
          className={styles.searchButton}
          aria-label="Search"
          onClick={() => setOpen(true)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M16 16L12.5 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : (
        <div className={styles.inputWrap}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              mode === "music" ? "Search albums and artists" : "Search users"
            }
            className={styles.input}
          />
          <button
            type="button"
            className={styles.clearButton}
            aria-label="Close search"
            onClick={handleClose}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L11 11M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      {open &&
        anchorRect &&
        createPortal(
          <div
            className={styles.dropdown}
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: anchorRect.bottom + 8,
              left: anchorRect.left,
              width: anchorRect.width,
            }}
          >
            <button
              type="button"
              className={styles.modeToggle}
              onClick={() =>
                setMode((prev) => (prev === "music" ? "users" : "music"))
              }
            >
              {mode === "music"
                ? "Search for users instead"
                : "Search for albums & artists instead"}
            </button>

            {showHint ? (
              <p className={styles.hint}>Keep typing to search…</p>
            ) : loading ? (
              <p className={styles.hint}>Searching…</p>
            ) : mode === "music" ? (
              hasMusicResults ? (
                <>
                  {musicResults.albums.length > 0 && (
                    <div className={styles.group}>
                      <span className={styles.groupLabel}>Albums</span>
                      {musicResults.albums.map((result) => (
                        <SearchResultRow
                          key={`album-${result.id}`}
                          result={result}
                          onNavigate={handleClose}
                        />
                      ))}
                    </div>
                  )}
                  {musicResults.artists.length > 0 && (
                    <div className={styles.group}>
                      <span className={styles.groupLabel}>Artists</span>
                      {musicResults.artists.map((result) => (
                        <SearchResultRow
                          key={`artist-${result.id}`}
                          result={result}
                          onNavigate={handleClose}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className={styles.hint}>
                  No results for &ldquo;{trimmedQuery}&rdquo;
                </p>
              )
            ) : userResults.length > 0 ? (
              <div className={styles.group}>
                {userResults.map((user) => (
                  <UserResultRow
                    key={user.id}
                    user={user}
                    onNavigate={handleClose}
                  />
                ))}
              </div>
            ) : (
              <p className={styles.hint}>
                No users found for &ldquo;{trimmedQuery}&rdquo;
              </p>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default SearchBar;
