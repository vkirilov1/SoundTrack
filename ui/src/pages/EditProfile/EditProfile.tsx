import { useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  resetProfilePhoto,
  updateProfile,
  uploadProfilePhoto,
} from "../../api/authApi";
import { ApiError } from "../../api/ApiError";
import { useAuth } from "../../context/useAuth";
import { userPhotoUrl } from "../../lib/images";
import type { FieldErrors } from "../../types/auth";
import styles from "./EditProfile.module.css";

function EditProfile() {
  const navigate = useNavigate();
  const { user, isLoading, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [photoError, setPhotoError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return null;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPhotoError(null);

    if (preview) URL.revokeObjectURL(preview);

    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setPhotoError(null);
    setUploading(true);

    try {
      const updated = await uploadProfilePhoto(selectedFile);
      updateUser(updated);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setPhotoError(
        error instanceof ApiError
          ? error.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleResetPhoto() {
    setPhotoError(null);
    setResetting(true);

    try {
      const updated = await resetProfilePhoto();
      updateUser(updated);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setPhotoError(
        error instanceof ApiError
          ? error.message
          : "Reset failed. Please try again.",
      );
    } finally {
      setResetting(false);
    }
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

  const avatarSrc =
    preview ?? userPhotoUrl(user.profilePictureUrl ?? "userDefault.png");

  return (
    <section className={styles.wrap}>
      <h1 className={styles.heading}>It's You!</h1>

      <div className={styles.photoRow}>
        <div className={styles.avatarCol}>
          <img src={avatarSrc} alt={user.username} className={styles.avatar} />
          <button
            type="button"
            className={styles.resetLink}
            onClick={handleResetPhoto}
            disabled={resetting}
          >
            {resetting ? "Resetting…" : "Reset to Default"}
          </button>
        </div>

        <div className={styles.uploadCol}>
          <label className={styles.chooseFile}>
            Choose File
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className={styles.hiddenInput}
            />
          </label>
          <p className={styles.hint}>
            Image will be cropped to a circular shape, similar to the example
          </p>
          {photoError && <p className={styles.error}>{photoError}</p>}
          <button
            type="button"
            className={styles.uploadButton}
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>

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

export default EditProfile;
