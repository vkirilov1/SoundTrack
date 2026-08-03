import { Link } from "react-router-dom";
import { userPhotoUrl } from "../../../utils/images";
import type { UserProfile } from "../../../types/auth";
import styles from "./UserResultRow.module.css";

interface UserResultRowProps {
  user: UserProfile;
  onNavigate: () => void;
}

function UserResultRow({ user, onNavigate }: UserResultRowProps) {
  return (
    <Link
      to={`/profile/${user.id}`}
      className={styles.resultRow}
      onClick={onNavigate}
    >
      <img
        src={userPhotoUrl(user.profilePictureUrl ?? "userDefault.png")}
        alt=""
        className={styles.resultAvatar}
      />
      <span className={styles.resultTitle}>{user.username}</span>
    </Link>
  );
}

export default UserResultRow;
