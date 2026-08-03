import { useState } from "react";
import type { SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  resetProfilePhoto,
  updateProfile,
  uploadProfilePhoto,
} from "../api/profileApi";
import { ApiError } from "../../../lib/api-error";
import { useAuth } from "../../../features/auth/stores/useAuth";
import { userPhotoUrl } from "../../../utils/images";
import type { FieldErrors } from "../../../types/auth";
import AvatarUploadCard from "./AvatarUploadCard";
import styles from "./EditProfileForm.module.css";

function EditProfileForm() {
  const navigate = useNavigate();
  const { user, isLoading, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return null;
  }

  async function handleSaveProfile(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: FieldErrors = {};
    if (!username.trim()) errors.username = "Username cannot be blank";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSaving(true);

    try {
      const updated = await updateProfile({
        username: username.trim(),
        bio: bio.trim(),
      });
      updateUser(updated);
      navigate(`/profile/${updated.id}`);
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
      } else if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.wrap}>
      <h1 className={styles.heading}>It's You!</h1>

      <AvatarUploadCard
        avatarSrc={userPhotoUrl(user.profilePictureUrl ?? "userDefault.png")}
        username={user.username}
        onUpload={(file) => uploadProfilePhoto(file).then(updateUser)}
        onReset={() => resetProfilePhoto().then(updateUser)}
      />

      <form className={styles.form} onSubmit={handleSaveProfile} noValidate>
        <h2 className={styles.subheading}>Profile Data</h2>

        {formError && <p className={styles.formError}>{formError}</p>}

        <label className={styles.field}>
          <span className={styles.label}>Display Name</span>
          <input
            type="text"
            value={username}
            maxLength={20}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
          />
          {fieldErrors.username && (
            <span className={styles.error}>{fieldErrors.username}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>About you</span>
          <textarea
            value={bio}
            maxLength={1024}
            onChange={(e) => setBio(e.target.value)}
            className={styles.textarea}
            rows={4}
          />
          {fieldErrors.bio && (
            <span className={styles.error}>{fieldErrors.bio}</span>
          )}
        </label>

        <button type="submit" className={styles.saveButton} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </section>
  );
}

export default EditProfileForm;
