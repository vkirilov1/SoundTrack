import { useCallback, useState } from "react";
import { chakra } from "@chakra-ui/react";
import Pagination from "../../../../components/Pagination/Pagination";
import PagedSection from "../../../../components/PagedSection/PagedSection";
import { usePagedList } from "../../../../hooks/usePagedList";
import {
  approveAlbumSuggestion,
  getAlbumSuggestions,
  rejectAlbumSuggestion,
} from "../api/dropsModerationApi";
import AlbumSuggestionRow from "./AlbumSuggestionRow";

type ActionStatus = "idle" | "working";

function SubmittedAlbumsCard() {
  const fetchSuggestions = useCallback(
    (page: number) => getAlbumSuggestions(page),
    [],
  );
  const {
    items: suggestions,
    setItems: setSuggestions,
    page,
    totalPages,
    loading,
    listLoading,
    goToPage,
  } = usePagedList(fetchSuggestions);

  const [actionStatus, setActionStatus] = useState<
    Record<number, ActionStatus>
  >({});

  function withStatus(id: number, action: () => Promise<void>) {
    setActionStatus((prev) => ({ ...prev, [id]: "working" }));
    return action().finally(() =>
      setActionStatus((prev) => ({ ...prev, [id]: "idle" })),
    );
  }

  function handleApprove(id: number) {
    return withStatus(id, () =>
      approveAlbumSuggestion(id)
        .then((updated) =>
          setSuggestions((prev) =>
            prev.map((s) => (s.id === id ? updated : s)),
          ),
        )
        .catch(() => {}),
    );
  }

  function handleReject(id: number) {
    return withStatus(id, () =>
      rejectAlbumSuggestion(id)
        .then((updated) =>
          setSuggestions((prev) =>
            prev.map((s) => (s.id === id ? updated : s)),
          ),
        )
        .catch(() => {}),
    );
  }

  return (
    <>
      <PagedSection
        loading={loading}
        listLoading={listLoading}
        isEmpty={suggestions.length === 0}
        emptyMessage="No submitted albums yet."
        spinnerLabel="Loading suggestions"
      >
        <chakra.ul mt="16px" listStyle="none" p="0" m="0">
          {suggestions.map((suggestion) => (
            <AlbumSuggestionRow
              key={suggestion.id}
              suggestion={suggestion}
              onApprove={(id) => void handleApprove(id)}
              onReject={(id) => void handleReject(id)}
              actionPending={actionStatus[suggestion.id] === "working"}
            />
          ))}
        </chakra.ul>
      </PagedSection>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </>
  );
}

export default SubmittedAlbumsCard;
