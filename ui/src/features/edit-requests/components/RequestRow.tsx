import { Link } from "react-router-dom";
import CheckIcon from "../../../components/CheckIcon/CheckIcon";
import XIcon from "../../../components/XIcon/XIcon";
import { artistImageUrl, coverImageUrl } from "../../../utils/images";
import { SHORT_DATE_FORMAT } from "../../../utils/date";
import type { EditRequest } from "../types";
import styles from "./RequestRow.module.css";

interface RequestRowProps {
  request: EditRequest;
  status: "idle" | "working";
  actionError?: string;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

function RequestRow({
  request,
  status,
  actionError,
  onApprove,
  onReject,
}: RequestRowProps) {
  const targetHref =
    request.targetType === "ALBUM"
      ? `/album/${request.targetId}`
      : `/artist/${request.targetId}`;
  const imageSrc = request.targetPhotoUrl
    ? request.targetType === "ALBUM"
      ? coverImageUrl(request.targetPhotoUrl)
      : artistImageUrl(request.targetPhotoUrl)
    : null;

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        {imageSrc ? (
          <img src={imageSrc} alt="" className={styles.thumb} />
        ) : (
          <span className={styles.thumbPlaceholder} aria-hidden="true" />
        )}

        <div className={styles.info}>
          <Link to={targetHref} className={styles.targetName}>
            {request.targetName}
          </Link>
          <span className={styles.type}>
            {request.targetType === "ALBUM" ? "Album" : "Artist"} description
          </span>
          <span className={styles.submittedBy}>
            Submitted by {request.requestedByUsername} on{" "}
            {SHORT_DATE_FORMAT.format(new Date(request.createdAt))}
          </span>
          <p className={styles.content}>{request.proposedDescription}</p>
        </div>

        {request.status === "PENDING" ? (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.approveButton}
              onClick={() => onApprove(request.id)}
              disabled={status === "working"}
              aria-label="Approve"
              title="Approve"
            >
              <CheckIcon size={16} />
            </button>
            <button
              type="button"
              className={styles.rejectButton}
              onClick={() => onReject(request.id)}
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
            {request.status === "APPROVED" ? "Approved" : "Rejected"} by{" "}
            {request.reviewedByUsername}
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
}

export default RequestRow;
