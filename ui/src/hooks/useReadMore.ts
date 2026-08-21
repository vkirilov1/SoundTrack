import { useState } from "react";

const DEFAULT_PREVIEW_LENGTH = 180;

export function useReadMore(
  text: string | null,
  previewLength = DEFAULT_PREVIEW_LENGTH,
) {
  const [expanded, setExpanded] = useState(false);

  const trimmed = text?.trim() || null;
  const showToggle = trimmed !== null && trimmed.length > previewLength;
  const displayText =
    trimmed && showToggle && !expanded
      ? `${trimmed.slice(0, previewLength).trimEnd()}…`
      : trimmed;

  function toggle() {
    setExpanded((prev) => !prev);
  }

  return { displayText, showToggle, expanded, toggle };
}
