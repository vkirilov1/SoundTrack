import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getUserProfile } from "../../api/profileApi";
import { ApiError } from "../../api/ApiError";
import missingResourcesIcon from "../../assets/MissingResources.png";
import Spinner from "../../components/Spinner/Spinner";
import { useAuth } from "../../context/useAuth";
import { MONTH_YEAR_FORMAT } from "../../lib/date";
import { userPhotoUrl } from "../../lib/images";
import type { UserProfile } from "../../types/auth";
import styles from "./Profile.module.css";
import ListsCard from "./components/ListsCard";
import ReviewsCard from "./components/ReviewsCard";

const ProfilePageStates = {
  Reviews: 0,
  Lists: 1,
};

function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);
  const invalidId = !Number.isFinite(id);
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentPageState, setCurrentPageState] = useState(
    ProfilePageStates.Lists,
  );
  const [loading, setLoading] = useState(() => !invalidId);
  const [notFound, setNotFound] = useState(() => invalidId);

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
        <div className={styles.status}>
          <Spinner />
        </div>
      </section>
    );
  }

  if (notFound || !profile) {
    return (
      <section className={styles.wrap}>
        <div className={styles.status}>
          <img
            src={missingResourcesIcon}
            alt=""
            className={styles.statusIcon}
          />
          <p>This user doesn't exist.</p>
        </div>
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
          <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </Link>
      )}
      <div className={styles.header}>
        <img
          src={userPhotoUrl(profile.profilePictureUrl ?? "userDefault.png")}
          alt={profile.username}
          className={styles.avatar}
        />
        <h1 className={styles.name}>{profile.username}</h1>
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        <p className={styles.joinDate}>
          Joined {MONTH_YEAR_FORMAT.format(new Date(profile.joinDate))}
        </p>
      </div>

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
    </section>
  );
}

export default Profile;
