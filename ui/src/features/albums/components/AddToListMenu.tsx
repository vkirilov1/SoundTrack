import type { AddStatus } from "../hooks/useAddToListMenu";
import type { UserListSummary } from "../../../types/list";
import styles from "./AddToListMenu.module.css";

interface AddToListMenuProps {
  lists: UserListSummary[] | null;
  listsLoading: boolean;
  addStatus: Record<number, AddStatus>;
  menuError: string | null;
  newListName: string;
  onNewListNameChange: (value: string) => void;
  creatingList: boolean;
  onAddToList: (listId: number) => void;
  onCreateList: (event: React.FormEvent) => void;
}

function AddToListMenu({
  lists,
  listsLoading,
  addStatus,
  menuError,
  newListName,
  onNewListNameChange,
  creatingList,
  onAddToList,
  onCreateList,
}: AddToListMenuProps) {
  return (
    <div className={styles.menu}>
      {listsLoading ? (
        <p className={styles.menuHint}>Loading your lists…</p>
      ) : lists && lists.length > 0 ? (
        <ul className={styles.menuList}>
          {lists.map((list) => {
            const status = addStatus[list.id] ?? "idle";
            return (
              <li key={list.id}>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => onAddToList(list.id)}
                  disabled={status === "adding" || status === "added"}
                >
                  <span>{list.name}</span>
                  <span className={styles.menuItemStatus}>
                    {status === "adding"
                      ? "Adding…"
                      : status === "added"
                        ? "Added ✓"
                        : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.menuHint}>You don't have any lists yet.</p>
      )}

      {menuError && <p className={styles.menuError}>{menuError}</p>}

      <form className={styles.createForm} onSubmit={onCreateList}>
        <input
          type="text"
          className={styles.createInput}
          placeholder="New list name"
          value={newListName}
          maxLength={255}
          onChange={(event) => onNewListNameChange(event.target.value)}
        />
        <button
          type="submit"
          className={styles.createButton}
          disabled={creatingList || !newListName.trim()}
        >
          Create
        </button>
      </form>
    </div>
  );
}

export default AddToListMenu;
