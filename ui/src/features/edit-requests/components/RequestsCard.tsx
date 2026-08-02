import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  approveEditRequest,
  getEditRequests,
  rejectEditRequest,
} from "../api/editRequestApi";
import missingResourcesIcon from "../../../assets/MissingResources.png";
import CheckIcon from "../../../components/CheckIcon/CheckIcon";
import Pagination from "../../../components/Pagination/Pagination";
import Spinner from "../../../components/Spinner/Spinner";
import XIcon from "../../../components/XIcon/XIcon";
import { ApiError } from "../../../lib/api-error";
import { artistImageUrl, coverImageUrl } from "../../../utils/images";
import { SHORT_DATE_FORMAT } from "../../../utils/date";
import type { EditRequest } from "../types";
import styles from "./RequestsCard.module.css";

type ActionStatus = "idle" | "working";

function RequestsCard() {
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<
    Record<number, ActionStatus>
  >({});
  const [actionErrors, setActionErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    let cancelled = false;

    getEditRequests(0)
      .then((res) => {
        if (cancelled) return;
        setRequests(res.content);
        setPage(res.page);
        setTotalPages(res.totalPages);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;
    setListLoading(true);
    getEditRequests(nextPage)
      .then((res) => {
        setRequests(res.content);
        setPage(res.page);
        setTotalPages(res.totalPages);
      })
      .catch(() => {})
      .finally(() => setListLoading(false));
  };

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

  if (loading) {
    return (
      <div className={styles.empty}>
        <Spinner label="Loading requests" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className={styles.empty}>
        <img src={missingResourcesIcon} alt="" className={styles.emptyIcon} />
        <p>No requests yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.sectionWrap}>
        <div
          className={
            listLoading
              ? `${styles.sectionContent} ${styles.blurred}`
              : styles.sectionContent
          }
        >
          <ul className={styles.list}>
            {requests.map((request) => {
              const targetHref =
                request.targetType === "ALBUM"
                  ? `/album/${request.targetId}`
                  : `/artist/${request.targetId}`;
              const imageSrc = request.targetPhotoUrl
                ? request.targetType === "ALBUM"
                  ? coverImageUrl(request.targetPhotoUrl)
                  : artistImageUrl(request.targetPhotoUrl)
                : null;
              const status = actionStatus[request.id] ?? "idle";
              const actionError = actionErrors[request.id];

              return (
                <li key={request.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    {imageSrc ? (
                      <img src={imageSrc} alt="" className={styles.thumb} />
                    ) : (
                      <span
                        className={styles.thumbPlaceholder}
                        aria-hidden="true"
                      />
                    )}

                    <div className={styles.info}>
                      <Link to={targetHref} className={styles.targetName}>
                        {request.targetName}
                      </Link>
                      <span className={styles.type}>
                        {request.targetType === "ALBUM" ? "Album" : "Artist"}{" "}
                        description
                      </span>
                      <span className={styles.submittedBy}>
                        Submitted by {request.requestedByUsername} on{" "}
                        {SHORT_DATE_FORMAT.format(new Date(request.createdAt))}
                      </span>
                      <p className={styles.content}>
                        {request.proposedDescription}
                      </p>
                    </div>

                    {request.status === "PENDING" ? (
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.approveButton}
                          onClick={() => handleApprove(request.id)}
                          disabled={status === "working"}
                          aria-label="Approve"
                          title="Approve"
                        >
                          <CheckIcon size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.rejectButton}
                          onClick={() => handleReject(request.id)}
                          disabled={status === "working"}
                          aria-label="Reject"
                          title="Reject"
                        >
                          <XIcon size={16} />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={
                          request.status === "APPROVED"
                            ? styles.approvedLabel
                            : styles.rejectedLabel
                        }
                      >
                        {request.status === "APPROVED"
                          ? "Approved"
                          : "Rejected"}{" "}
                        by {request.reviewedByUsername}
                      </span>
                    )}
                  </div>

                  {actionError && (
                    <div className={styles.actionError} role="alert">
                      {actionError}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        {listLoading && (
          <div className={styles.loadingOverlay}>
            <Spinner label="Loading requests" />
          </div>
        )}
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}

export default RequestsCard;
