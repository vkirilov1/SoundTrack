import Avatar from "../../../components/Avatar/Avatar";
import { userPhotoUrl } from "../../../utils/images";
import type { UserProfile } from "../../../types/auth";
import ResultRowLink, { ResultRowButton, ResultTitle } from "./ResultRowLink";

interface UserResultRowProps {
  user: UserProfile;
  onNavigate?: () => void;
  onSelect?: (user: UserProfile) => void;
}

function UserResultRow({ user, onNavigate, onSelect }: UserResultRowProps) {
  const content = (
    <>
      <Avatar
        src={userPhotoUrl(user.profilePictureUrl ?? "userDefault.png")}
        alt=""
        size="32px"
      />
      <ResultTitle>{user.username}</ResultTitle>
    </>
  );

  if (onSelect) {
    return (
      <ResultRowButton onSelect={() => onSelect(user)}>
        {content}
      </ResultRowButton>
    );
  }

  return (
    <ResultRowLink
      to={`/profile/${user.id}`}
      onNavigate={onNavigate ?? (() => {})}
    >
      {content}
    </ResultRowLink>
  );
}

export default UserResultRow;
