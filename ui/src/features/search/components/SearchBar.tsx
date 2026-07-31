import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { search, searchUsers } from "../api/searchApi";
import { artistImageUrl, coverImageUrl, userPhotoUrl } from "../../../utils/images";
import type { UserProfile } from "../../../types/auth";
import type { SearchResponse, SearchResult } from "../types";
import styles from "./SearchBar.module.css";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const EMPTY_MUSIC_RESULTS: SearchResponse = { albums: [], artists: [] };

type Mode = "music" | "users";

function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("music");
  const [musicResults, setMusicResults] =
    useState<SearchResponse>(EMPTY_MUSIC_RESULTS);
  const [userResults, setUserResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const insideContainer = containerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideContainer && !insideDropdown) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      return;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    const timer = setTimeout(() => {
      setLoading(true);

      const request = mode === "music" ? search(trimmed) : searchUsers(trimmed);

      request.then((result) => {
        if (requestId !== requestIdRef.current) return;

        if (mode === "music") {
          setMusicResults(result as SearchResponse);
        } else {
          setUserResults(result as UserProfile[]);
        }
        setLoading(false);
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, mode]);

  function handleClose() {
    setOpen(false);
    setQuery("");
    setMode("music");
    setMusicResults(EMPTY_MUSIC_RESULTS);
    setUserResults([]);
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
                  <Link
                    key={user.id}
                    to={`/profile/${user.id}`}
                    className={styles.resultRow}
                    onClick={handleClose}
                  >
                    <img
                      src={userPhotoUrl(
                        user.profilePictureUrl ?? "userDefault.png",
                      )}
                      alt=""
                      className={styles.resultAvatar}
                    />
                    <span className={styles.resultTitle}>{user.username}</span>
                  </Link>
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

interface SearchResultRowProps {
  result: SearchResult;
  onNavigate: () => void;
}

function SearchResultRow({ result, onNavigate }: SearchResultRowProps) {
  const href =
    result.type === "ALBUM" ? `/album/${result.id}` : `/artist/${result.id}`;
  const imageSrc = result.imageUrl
    ? result.type === "ALBUM"
      ? coverImageUrl(result.imageUrl)
      : artistImageUrl(result.imageUrl)
    : null;

  return (
    <Link to={href} className={styles.resultRow} onClick={onNavigate}>
      {imageSrc ? (
        <img src={imageSrc} alt="" className={styles.resultThumb} />
      ) : (
        <span className={styles.resultThumbPlaceholder} aria-hidden="true" />
      )}
      <span className={styles.resultText}>
        <span className={styles.resultTitle}>{result.title}</span>
        {result.subtitle && (
          <span className={styles.resultSubtitle}>{result.subtitle}</span>
        )}
      </span>
    </Link>
  );
}

export default SearchBar;
