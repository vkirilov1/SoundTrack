import ConfirmDeleteControl from "../../../components/ConfirmDeleteControl/ConfirmDeleteControl";
import { deleteReviewAsAdmin } from "../api/adminContentApi";

interface AdminReviewDeleteControlProps {
  reviewId: number;
  onDeleted: (reviewId: number) => void;
  label?: string;
}

function AdminReviewDeleteControl({
  reviewId,
  onDeleted,
  label = "Delete review",
}: AdminReviewDeleteControlProps) {
  function handleDelete() {
    return deleteReviewAsAdmin(reviewId).then(() => onDeleted(reviewId));
  }

  return (
    <ConfirmDeleteControl
      label={label}
      confirmMessage="Delete this review?"
      onDelete={handleDelete}
    />
  );
}

export default AdminReviewDeleteControl;
