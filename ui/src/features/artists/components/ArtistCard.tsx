import { Box, Heading, Image, Text } from "@chakra-ui/react";
import type { ArtistDetail } from "../types";
import { artistImageUrl } from "../../../utils/images";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
    >
      <Box position="relative">
        {artist.artistPic ? (
          <Image
            src={artistImageUrl(artist.artistPic)}
            alt={artist.name}
            boxSize="180px"
            borderRadius="md"
            objectFit="cover"
            bg="border"
            mx="auto"
          />
        ) : (
          <Box
            as="span"
            aria-hidden="true"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxSize="180px"
            border="1.5px solid"
            borderColor="border"
            borderRadius="md"
            color="text"
            opacity="0.55"
          >
            <ImagePlaceholderIcon size={64} />
          </Box>
        )}
        {isAdmin && (
          <AdminPhotoEditButton
            onSavePhoto={handleSavePhoto}
            label="Change photo"
          />
        )}
      </Box>

      <Heading as="h1" mt="20px" fontSize="26px">
        {artist.name}
      </Heading>

      {meta && (
        <Text mt="6px" fontSize="13px" color="text" opacity="0.7">
          {meta}
        </Text>
      )}

      <Box mt="16px" w="100%">
        <EditableDescription
          text={artist.biography}
          targetType="ARTIST"
          targetId={artist.id}
          onSave={handleSaveDescription}
          maxW="580px"
          align="center"
        />
      </Box>
    </Box>
  );
}

export default ArtistCard;
