import { useState } from "react";
import { useAuth } from "../../auth/stores/useAuth";
import { useReadMore } from "../../../hooks/useReadMore";
import type { EditRequestTargetType } from "../types";
import AdminDescriptionEditButton from "./AdminDescriptionEditButton";
import SuggestEditLink from "./SuggestEditLink";

interface EditableDescriptionClassNames {
  paragraph: string;
  /** Defaults to `paragraph` when the text is empty. */
  emptyParagraph?: string;
  actions: string;
  readMoreButton: string;
}

interface EditableDescriptionProps {
  text: string | null;
  emptyText?: string;
  targetType: EditRequestTargetType;
  targetId: number;
  onSave: (text: string) => Promise<unknown>;
  classNames: EditableDescriptionClassNames;
}

/**
 * Read-more-truncated description text plus its edit affordance: an inline
 * edit form for admins, a "suggest an edit" request for everyone else. Used
 * on both album and artist pages, which each supply their own CSS classes
 * since the surrounding layouts (max-width, alignment) differ per page.
 */
function EditableDescription({
  text,
  emptyText = "No description yet.",
  targetType,
  targetId,
  onSave,
  classNames,
}: EditableDescriptionProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const [editing, setEditing] = useState(false);
  const { displayText, showToggle, expanded, toggle } = useReadMore(text);

  return (
    <>
      {!editing &&
        (displayText ? (
          <p className={classNames.paragraph}>{displayText}</p>
        ) : (
          <p className={classNames.emptyParagraph ?? classNames.paragraph}>
            {emptyText}
          </p>
        ))}

      <div className={classNames.actions}>
        {!editing && showToggle && (
          <button
            type="button"
            className={classNames.readMoreButton}
            onClick={toggle}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {isAdmin ? (
          <AdminDescriptionEditButton
            currentDescription={text}
            onSaveDescription={onSave}
            onEditingChange={setEditing}
          />
        ) : (
          currentUser && (
            <SuggestEditLink
              targetType={targetType}
              targetId={targetId}
              currentDescription={text}
              onEditingChange={setEditing}
            />
          )
        )}
      </div>
    </>
  );
}

export default EditableDescription;
