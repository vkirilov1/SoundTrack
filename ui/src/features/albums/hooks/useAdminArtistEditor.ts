import { useState } from "react";
import { searchAdminArtists } from "../../edit-requests/api/adminContentApi";
import { useSearchDropdown } from "../../../hooks/useSearchDropdown";
import type { AlbumArtist } from "../types";

/**
 * Search-and-add-artist state shared by any "credited artists" editor (albums, songs, and any
 * future entity that credits artists) - only the persistence call differs between them, so it's
 * passed in rather than hardcoded.
 */
export function useAdminArtistEditor(
  entityId: number,
  addArtist: (
    entityId: number,
    artistId: number,
  ) => Promise<{ artists: AlbumArtist[] }>,
  onArtistsChange: (artists: AlbumArtist[]) => void,
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
  } = useSearchDropdown(searchAdminArtists);

  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openMenu() {
    toggleMenu();
    setError(null);
  }

  function handleAdd(artistId: number) {
    if (adding) return;

    setAdding(true);
    setError(null);

    addArtist(entityId, artistId)
      .then((updated) => {
        onArtistsChange(updated.artists);
        closeMenu();
      })
      .catch(() => setError("Couldn't add that artist."))
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
