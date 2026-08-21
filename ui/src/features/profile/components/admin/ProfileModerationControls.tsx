import AdminResetPhotoButton from "../../../edit-requests/components/AdminResetPhotoButton";
import ChatAccessButton from "../../../chat/moderation/components/ChatAccessButton";

interface ProfileModerationControlsProps {
  userId: number;
  chatAccessRevoked: boolean;
  onResetPhoto: () => Promise<unknown>;
  onChatAccessChange: (revoked: boolean) => void;
}

function ProfileModerationControls({
  userId,
  chatAccessRevoked,
  onResetPhoto,
  onChatAccessChange,
}: ProfileModerationControlsProps) {
  return (
    <>
      <AdminResetPhotoButton onReset={onResetPhoto} />
      <ChatAccessButton
        userId={userId}
        revoked={chatAccessRevoked}
        onChange={onChatAccessChange}
      />
    </>
  );
}

export default ProfileModerationControls;
