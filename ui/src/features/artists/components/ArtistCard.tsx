import { useState } from "react";
import { Box, Heading, HStack, Image, Text } from "@chakra-ui/react";
import type { ArtistDetail } from "../types";
import { artistImageUrl } from "../../../utils/images";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import EditIconButton from "../../../components/buttons/EditIconButton";
import { useAuth } from "../../auth/stores/useAuth";
import AdminPhotoEditButton from "../../edit-requests/components/AdminPhotoEditButton";
import EditableDescription from "../../edit-requests/components/EditableDescription";
import InlineTextEditForm from "../../edit-requests/components/InlineTextEditForm";
import {
  updateArtistCountry,
  updateArtistDescription,
  updateArtistName,
  updateArtistType,
  uploadArtistPhoto,
} from "../../edit-requests/api/adminContentApi";

interface ArtistCardProps {
  artist: ArtistDetail;
  onNameChange: (name: string) => void;
  onCountryChange: (country: string | null) => void;
  onTypeChange: (type: string | null) => void;
  onBiographyChange: (biography: string | null) => void;
  onPhotoChange: (artistPic: string | null) => void;
}

function ArtistCard({
  artist,
  onNameChange,
  onCountryChange,
  onTypeChange,
  onBiographyChange,
  onPhotoChange,
}: ArtistCardProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const meta = [artist.type, artist.country].filter(Boolean).join(", ");

  const [editingName, setEditingName] = useState(false);
  const [editingCountry, setEditingCountry] = useState(false);
  const [editingType, setEditingType] = useState(false);

  async function handleSaveName(name: string) {
    const updated = await updateArtistName(
      artist.id,
      name,
      artist.country,
      artist.type,
      artist.biography,
    );
    onNameChange(updated.name);
  }

  async function handleSaveCountry(country: string) {
    const updated = await updateArtistCountry(
      artist.id,
      artist.name,
      country,
      artist.type,
      artist.biography,
    );
    onCountryChange(updated.country);
  }

  async function handleSaveType(type: string) {
    const updated = await updateArtistType(
      artist.id,
      artist.name,
      artist.country,
      type,
      artist.biography,
    );
    onTypeChange(updated.type);
  }

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

      <HStack mt="20px" align="center" gap="6px" justify="center">
        {!editingName && (
          <Heading as="h1" fontSize="26px" m="0">
            {artist.name}
          </Heading>
        )}
        {isAdmin && (
          <InlineTextEditForm
            currentText={artist.name}
            onSubmit={handleSaveName}
            onEditingChange={setEditingName}
            variant="text"
            maxLength={255}
            formWidth="260px"
            disallowEmpty
            autoFocusTextarea
            submitLabel="Save"
            submittingLabel="Saving…"
            errorFallback="Couldn't save the name."
            renderTrigger={(open) => (
              <EditIconButton onClick={open} label="Edit artist name" />
            )}
          />
        )}
      </HStack>

      {isAdmin ? (
        <HStack
          mt="6px"
          align="center"
          gap="4px"
          justify="center"
          flexWrap="wrap"
        >
          {!editingType && (
            <Text fontSize="13px" color="text" opacity="0.7">
              {artist.type || "Unknown type"}
            </Text>
          )}
          <InlineTextEditForm
            currentText={artist.type ?? ""}
            onSubmit={handleSaveType}
            onEditingChange={setEditingType}
            variant="text"
            maxLength={100}
            formWidth="220px"
            submitLabel="Save"
            submittingLabel="Saving…"
            errorFallback="Couldn't save the type."
            renderTrigger={(open) => (
              <EditIconButton
                onClick={open}
                label="Edit artist type"
                size={11}
              />
            )}
          />
          <Text fontSize="13px" color="text" opacity="0.4">
            ·
          </Text>
          {!editingCountry && (
            <Text fontSize="13px" color="text" opacity="0.7">
              {artist.country || "Unknown country"}
            </Text>
          )}
          <InlineTextEditForm
            currentText={artist.country ?? ""}
            onSubmit={handleSaveCountry}
            onEditingChange={setEditingCountry}
            variant="text"
            maxLength={2}
            formWidth="220px"
            submitLabel="Save"
            submittingLabel="Saving…"
            errorFallback="Couldn't save the country."
            renderTrigger={(open) => (
              <EditIconButton
                onClick={open}
                label="Edit artist country"
                size={11}
              />
            )}
          />
        </HStack>
      ) : (
        meta && (
          <Text mt="6px" fontSize="13px" color="text" opacity="0.7">
            {meta}
          </Text>
        )
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
