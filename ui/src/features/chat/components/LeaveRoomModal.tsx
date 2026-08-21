import ConfirmActionModal from "../../../components/Modal/ConfirmActionModal";

interface LeaveRoomModalProps {
  roomName: string;
  isOwner: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** Confirmation for leaving a chat room - as the owner this closes the room for everyone. */
function LeaveRoomModal({
  roomName,
  isOwner,
  onConfirm,
  onClose,
}: LeaveRoomModalProps) {
  return (
    <ConfirmActionModal
      title="Leave Chat Room"
      message={
        isOwner
          ? `You are the owner of “${roomName}”. Leaving will close the room for everyone.`
          : `Are you sure you want to leave “${roomName}”?`
      }
      confirmLabel={isOwner ? "Close room" : "Leave room"}
      confirmingLabel="Leaving…"
      tone="danger"
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

export default LeaveRoomModal;
