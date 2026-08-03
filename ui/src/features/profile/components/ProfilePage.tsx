import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getUserProfile } from "../api/profileApi";
import { ApiError } from "../../../lib/api-error";
import EditIcon from "../../../components/EditIcon/EditIcon";
import PageStatus from "../../../components/PageStatus/PageStatus";
import { useAuth } from "../../../features/auth/stores/useAuth";
import { MONTH_YEAR_FORMAT } from "../../../utils/date";
import { userPhotoUrl } from "../../../utils/images";
import type { UserProfile } from "../../../types/auth";
import styles from "./ProfilePage.module.css";
import ListsCard from "./ListsCard";
import ReviewsCard from "./ReviewsCard";
import RequestsCard from "../../edit-requests/components/RequestsCard";
import AdminResetPhotoButton from "../../edit-requests/components/AdminResetPhotoButton";
import { resetUserPhotoAsAdmin } from "../../edit-requests/api/adminContentApi";

const ProfilePageStates = {
  Reviews: 0,
  Lists: 1,
};

function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);
  const invalidId = !Number.isFinite(id);
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentPageState, setCurrentPageState] = useState(
    ProfilePageStates.Lists,
  );
  const [loading, setLoading] = useState(() => !invalidId);
  const [notFound, setNotFound] = useState(() => invalidId);

  const isOwnAdminProfile =
    currentUser?.id === id && currentUser?.role === "ADMIN";
  const canModeratePhoto = isAdmin && currentUser?.id !== id;

  function handleResetPhoto() {
    return resetUserPhotoAsAdmin(id).then((updated) => {
      setProfile((prev) =>
        prev ? { ...prev, profilePictureUrl: updated.profilePictureUrl } : prev,
      );
    });
  }

  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    getUserProfile(id)
      .then((profileRes) => {
        if (cancelled) return;
        setProfile(profileRes);
        setNotFound(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, invalidId]);

  if (loading) {
    return (
      <section className={styles.wrap}>
        <PageStatus variant="loading" />
      </section>
    );
  }

  if (notFound || !profile) {
    return (
      <section className={styles.wrap}>
        <PageStatus variant="not-found" message="This user doesn't exist." />
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      {currentUser?.id === profile.id && (
        <Link
          to="/profile/edit"
          className={styles.editButtonCorner}
          aria-label="Edit profile"
        >
          <EditIcon />
        </Link>
      )}
      <div className={styles.header}>
        <img
          src={userPhotoUrl(profile.profilePictureUrl ?? "userDefault.png")}
          alt={profile.username}
          className={styles.avatar}
        />
        {canModeratePhoto && (
          <AdminResetPhotoButton onReset={handleResetPhoto} />
        )}
        <h1 className={styles.name}>{profile.username}</h1>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        <p className={styles.joinDate}>
          Joined {MONTH_YEAR_FORMAT.format(new Date(profile.joinDate))}
        </p>
      </div>

      {isOwnAdminProfile ? (
        <div className={styles.sections}>
          <div className={styles.column}>
            <RequestsCard />
          </div>
        </div>
      ) : (
        <>
          <div className={styles.viewToggle}>
            <button
              type="button"
              className={
                currentPageState === ProfilePageStates.Lists
                  ? `${styles.viewToggleButton} ${styles.active}`
                  : styles.viewToggleButton
              }
              onClick={() => setCurrentPageState(ProfilePageStates.Lists)}
            >
              Lists
            </button>
            <button
              type="button"
              className={
                currentPageState === ProfilePageStates.Reviews
                  ? `${styles.viewToggleButton} ${styles.active}`
                  : styles.viewToggleButton
              }
              onClick={() => setCurrentPageState(ProfilePageStates.Reviews)}
            >
              Reviews
            </button>
          </div>

          <div className={styles.sections}>
            <div className={styles.column}>
              {currentPageState === ProfilePageStates.Lists ? (
                <ListsCard userId={id} />
              ) : (
                <ReviewsCard userId={id} />
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default ProfilePage;
