import { useState, type KeyboardEvent } from "react";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface EllipsisItem {
  ellipsis: true;
  key: string;
}

type PageItem = number | EllipsisItem;

const WINDOW_SIZE = 5;

function buildPageItems(current: number, total: number): PageItem[] {
  if (total <= WINDOW_SIZE + 2) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const start = Math.max(
    0,
    Math.min(current - Math.floor(WINDOW_SIZE / 2), total - WINDOW_SIZE),
  );
  const end = start + WINDOW_SIZE - 1;

  const items: PageItem[] = [];
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) {
    if (end < total - 2) items.push({ ellipsis: true, key: "e-end" });
    items.push(total - 1);
  }
  return items;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const [jumping, setJumping] = useState(false);
  const [jumpValue, setJumpValue] = useState("");

  if (totalPages <= 1) return null;

  const commitJump = () => {
    const parsed = Number(jumpValue);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= totalPages) {
      onPageChange(parsed - 1);
    }
    setJumping(false);
    setJumpValue("");
  };

  const handleJumpKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      commitJump();
    } else if (event.key === "Escape") {
      setJumping(false);
      setJumpValue("");
    }
  };

  const items = buildPageItems(page, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.arrow}
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        ‹
      </button>

      {items.map((item) => {
        if (typeof item === "number") {
          const isActive = item === page;
          return (
            <button
              key={item}
              type="button"
              className={
                isActive
                  ? `${styles.pageButton} ${styles.active}`
                  : styles.pageButton
              }
              onClick={() => onPageChange(item)}
              aria-current={isActive ? "page" : undefined}
            >
              {item + 1}
            </button>
          );
        }

        if (jumping) {
          return (
            <input
              key={item.key}
              type="number"
              min={1}
              max={totalPages}
              className={styles.jumpInput}
              value={jumpValue}
              autoFocus
              onChange={(event) => setJumpValue(event.target.value)}
              onKeyDown={handleJumpKeyDown}
              onBlur={commitJump}
            />
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            className={styles.ellipsis}
            onClick={() => setJumping(true)}
            aria-label="Jump to page"
          >
            …
          </button>
        );
      })}

      <button
        type="button"
        className={styles.arrow}
        disabled={page === totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}

export default Pagination;
