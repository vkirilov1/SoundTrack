import type { ArtistDetail } from "../types";
import { artistImageUrl } from "../../../utils/images";
import ImagePlaceholderIcon from "../../../components/ImagePlaceholderIcon/ImagePlaceholderIcon";
import styles from "./ArtistCard.module.css";
import { useAuth } from "../../auth/stores/useAuth";
import AdminPhotoEditButton from "../../edit-requests/components/AdminPhotoEditButton";
import EditableDescription from "../../edit-requests/components/EditableDescription";
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
            <ImagePlaceholderIcon size={64} />
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

      <EditableDescription
        text={artist.biography}
        targetType="ARTIST"
        targetId={artist.id}
        onSave={handleSaveDescription}
        classNames={{
          paragraph: styles.bio,
          actions: styles.bioActions,
          readMoreButton: styles.readMoreButton,
        }}
      />
    </div>
  );
}

export default ArtistCard;
