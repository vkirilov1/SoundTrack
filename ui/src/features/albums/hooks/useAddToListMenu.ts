import { useEffect, useRef, useState } from "react";
import { addAlbumToList, createList, getMyLists } from "../api/listApi";
import { ApiError } from "../../../lib/api-error";
import type { UserListSummary } from "../../../types/list";

export type AddStatus = "idle" | "adding" | "added" | "error";

/**
 * Drives the "add this album to one of my lists" dropdown: lazy-loads the user's
 * lists (pre-flagging ones that already contain the album so they render
 * disabled instead of risking a 409), handles adding, and inline list creation.
 * Shared between the album page's full pill button and the artist page's
 * compact icon button.
 */
export function useAddToListMenu(albumId: number) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lists, setLists] = useState<UserListSummary[] | null>(null);
  const [listsLoading, setListsLoading] = useState(false);
  const [addStatus, setAddStatus] = useState<Record<number, AddStatus>>({});
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);

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

  function openMenu() {
    setMenuOpen((open) => !open);
    if (lists === null && !listsLoading) {
      setListsLoading(true);
      setMenuError(null);
      getMyLists(0, 50, albumId)
        .then((res) => {
          setLists(res.content);
          setAddStatus((prev) => {
            const next = { ...prev };
            res.content.forEach((list) => {
              if (list.containsAlbum) next[list.id] = "added";
            });
            return next;
          });
        })
        .catch(() => setMenuError("Couldn't load your lists."))
        .finally(() => setListsLoading(false));
    }
  }

  function handleAddToList(listId: number) {
    setAddStatus((prev) => ({ ...prev, [listId]: "adding" }));
    addAlbumToList(listId, albumId)
      .then(() => setAddStatus((prev) => ({ ...prev, [listId]: "added" })))
      .catch((error: unknown) => {
        setAddStatus((prev) => ({ ...prev, [listId]: "error" }));
        if (error instanceof ApiError && error.status === 409) {
          setAddStatus((prev) => ({ ...prev, [listId]: "added" }));
        }
      });
  }

  function handleCreateList(event: React.FormEvent) {
    event.preventDefault();
    const name = newListName.trim();
    if (!name || creatingList) return;

    setCreatingList(true);
    setMenuError(null);

    createList(name)
      .then((created) => {
        setLists((prev) => [
          {
            id: created.id,
            name: created.name,
            description: null,
            itemCount: 0,
            coverUrl: null,
            containsAlbum: false,
          },
          ...(prev ?? []),
        ]);
        setNewListName("");
        handleAddToList(created.id);
      })
      .catch(() => setMenuError("Couldn't create the list."))
      .finally(() => setCreatingList(false));
  }

  return {
    menuOpen,
    lists,
    listsLoading,
    addStatus,
    newListName,
    setNewListName,
    creatingList,
    menuError,
    menuRef,
    openMenu,
    handleAddToList,
    handleCreateList,
  };
}
