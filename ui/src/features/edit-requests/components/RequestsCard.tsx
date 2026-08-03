import { useCallback, useState } from "react";
import {
  approveEditRequest,
  getEditRequests,
  rejectEditRequest,
} from "../api/editRequestApi";
import Pagination from "../../../components/Pagination/Pagination";
import PagedSection from "../../../components/PagedSection/PagedSection";
import { ApiError } from "../../../lib/api-error";
import { usePagedList } from "../../../hooks/usePagedList";
import RequestRow from "./RequestRow";
import styles from "./RequestsCard.module.css";

type ActionStatus = "idle" | "working";

function RequestsCard() {
  const fetchRequests = useCallback(
    (page: number) => getEditRequests(page),
    [],
  );
  const {
    items: requests,
    setItems: setRequests,
    page,
    totalPages,
    loading,
    listLoading,
    goToPage,
  } = usePagedList(fetchRequests);

  const [actionStatus, setActionStatus] = useState<
    Record<number, ActionStatus>
  >({});
  const [actionErrors, setActionErrors] = useState<Record<number, string>>({});

  function clearActionError(id: number) {
    setActionErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleApprove(id: number) {
    setActionStatus((prev) => ({ ...prev, [id]: "working" }));
    clearActionError(id);
    approveEditRequest(id)
      .then((updated) => {
        setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      })
      .catch((error: unknown) => {
        setActionErrors((prev) => ({
          ...prev,
          [id]:
            error instanceof ApiError
              ? error.message
              : "Couldn't approve this request.",
        }));
      })
      .finally(() => setActionStatus((prev) => ({ ...prev, [id]: "idle" })));
  }

  function handleReject(id: number) {
    setActionStatus((prev) => ({ ...prev, [id]: "working" }));
    clearActionError(id);
    rejectEditRequest(id)
      .then((updated) => {
        setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      })
      .catch((error: unknown) => {
        setActionErrors((prev) => ({
          ...prev,
          [id]:
            error instanceof ApiError
              ? error.message
              : "Couldn't reject this request.",
        }));
      })
      .finally(() => setActionStatus((prev) => ({ ...prev, [id]: "idle" })));
  }

  return (
    <>
      <PagedSection
        loading={loading}
        listLoading={listLoading}
        isEmpty={requests.length === 0}
        emptyMessage="No requests yet."
        spinnerLabel="Loading requests"
      >
        <ul className={styles.list}>
          {requests.map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              status={actionStatus[request.id] ?? "idle"}
              actionError={actionErrors[request.id]}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </ul>
      </PagedSection>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </>
  );
}

export default RequestsCard;
