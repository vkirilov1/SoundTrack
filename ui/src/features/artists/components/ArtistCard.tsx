import { useState } from "react";
import type { ArtistDetail } from "../types";
import { artistImageUrl } from "../../../utils/images";
import styles from "./ArtistCard.module.css";
import { useAuth } from "../../auth/stores/useAuth";
import SuggestEditLink from "../../edit-requests/components/SuggestEditLink";
import AdminPhotoEditButton from "../../edit-requests/components/AdminPhotoEditButton";
import AdminDescriptionEditButton from "../../edit-requests/components/AdminDescriptionEditButton";
import {
  updateArtistDescription,
  uploadArtistPhoto,
} from "../../edit-requests/api/adminContentApi";

interface ArtistCardProps {
  artist: ArtistDetail;
  onBiographyChange: (biography: string | null) => void;
  onPhotoChange: (artistPic: string | null) => void;
}

function ArtistCard({
  artist,
  onBiographyChange,
  onPhotoChange,
}: ArtistCardProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const meta = [artist.type, artist.country].filter(Boolean).join(", ");
  const biography = artist.biography?.trim() || null;
  const [editingBio, setEditingBio] = useState(false);

  async function handleSaveDescription(text: string) {
    const updated = await updateArtistDescription(
      artist.id,
      artist.name,
      artist.country,
      artist.type,
      text,
    );
    onBiographyChange(updated.biography);
  }

  async function handleSavePhoto(file: File) {
    const updated = await uploadArtistPhoto(artist.id, file);
    onPhotoChange(updated.artistPic);
  }

  return (
    <div className={styles.card}>
      <div className={styles.photoWrap}>
        {artist.artistPic ? (
          <img
            src={artistImageUrl(artist.artistPic)}
            alt={artist.name}
            className={styles.photo}
          />
        ) : (
          <span className={styles.photoPlaceholder} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width={64}
              height={64}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </span>
        )}
        {isAdmin && (
          <AdminPhotoEditButton
            onSavePhoto={handleSavePhoto}
            label="Change photo"
          />
        )}
      </div>

      <h1 className={styles.name}>{artist.name}</h1>

      {meta && <p className={styles.meta}>{meta}</p>}

      {!editingBio && (
        <p className={styles.bio}>{biography ?? "No description yet."}</p>
      )}

      <div className={styles.bioActions}>
        {isAdmin ? (
          <AdminDescriptionEditButton
            currentDescription={artist.biography}
            onSaveDescription={handleSaveDescription}
            onEditingChange={setEditingBio}
          />
        ) : (
          currentUser && (
            <SuggestEditLink
              targetType="ARTIST"
              targetId={artist.id}
              currentDescription={artist.biography}
              onEditingChange={setEditingBio}
            />
          )
        )}
      </div>
    </div>
  );
}

export default ArtistCard;
