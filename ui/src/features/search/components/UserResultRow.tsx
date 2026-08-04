import Avatar from "../../../components/Avatar/Avatar";
import { userPhotoUrl } from "../../../utils/images";
import type { UserProfile } from "../../../types/auth";
import ResultRowLink, { ResultTitle } from "./ResultRowLink";

interface UserResultRowProps {
  user: UserProfile;
  onNavigate: () => void;
}

function UserResultRow({ user, onNavigate }: UserResultRowProps) {
  return (
    <ResultRowLink to={`/profile/${user.id}`} onNavigate={onNavigate}>
      <Avatar
        src={userPhotoUrl(user.profilePictureUrl ?? "userDefault.png")}
        alt=""
        size="32px"
      />
      <ResultTitle>{user.username}</ResultTitle>
    </ResultRowLink>
  );
}

export default UserResultRow;
