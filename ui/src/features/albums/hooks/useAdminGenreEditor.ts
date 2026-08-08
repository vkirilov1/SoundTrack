import { useState } from "react";
import {
  addAlbumGenre,
  searchAdminGenres,
} from "../../edit-requests/api/adminContentApi";
import { useSearchDropdown } from "../../../hooks/useSearchDropdown";

export function useAdminGenreEditor(
  albumId: number,
  onGenresChange: (genres: string[]) => void,
) {
  const {
    menuOpen,
    query,
    setQuery,
    results,
    searching,
    menuRef,
    toggleMenu,
    closeMenu,
  } = useSearchDropdown(searchAdminGenres);

  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openMenu() {
    toggleMenu();
    setError(null);
  }

  function handleAdd(genre: string) {
    const trimmed = genre.trim();
    if (!trimmed || adding) return;

    setAdding(true);
    setError(null);

    addAlbumGenre(albumId, trimmed)
      .then((updated) => {
        onGenresChange(updated.genres);
        closeMenu();
      })
      .catch(() => setError("Couldn't add that genre."))
      .finally(() => setAdding(false));
  }

  return {
    menuOpen,
    query,
    setQuery,
    results,
    searching,
    adding,
    error,
    menuRef,
    openMenu,
    handleAdd,
  };
}
