import { useState } from "react";
import { Box, HStack, Text, chakra } from "@chakra-ui/react";
import AddChipButton from "../../../../components/buttons/AddChipButton";
import CheckIcon from "../../../../components/icons/CheckIcon";
import XIcon from "../../../../components/icons/XIcon";
import { ApiError } from "../../../../lib/api-error";
import { addAlbumSong } from "../../../edit-requests/api/adminContentApi";
import { parseDurationInput } from "../../../../utils/duration";
import type { AlbumSong } from "../../types";

interface AddSongRowProps {
  albumId: number;
  nextPosition: number;
  onAdd: (song: AlbumSong) => void;
}

const inputStyle = {
  font: "inherit",
  fontSize: "13px",
  color: "ink",
  bg: "bg",
  border: "1px solid",
  borderColor: "border",
  borderRadius: "md",
  px: "8px",
  py: "6px",
  outline: "none",
  _focus: { borderColor: "accent" },
} as const;

function AddSongRow({ albumId, nextPosition, onAdd }: AddSongRowProps) {
  const [adding, setAdding] = useState(false);
  const [position, setPosition] = useState(String(nextPosition));
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setAdding(false);
    setPosition(String(nextPosition));
    setTitle("");
    setDuration("");
    setError(null);
  }

  async function handleSave() {
    const positionNumber = Number(position);
    const durationSeconds = parseDurationInput(duration);

    if (!title.trim()) {
      setError("Enter a song title.");
      return;
    }
    if (!positionNumber || positionNumber < 1) {
      setError("Enter a valid position.");
      return;
    }
    if (durationSeconds === null) {
      setError("Use M:SS format, e.g. 3:45");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const song = await addAlbumSong(
        albumId,
        positionNumber,
        title.trim(),
        durationSeconds,
      );
      onAdd(song);
      setAdding(false);
      setPosition(String(positionNumber + 1));
      setTitle("");
      setDuration("");
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't add the song.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!adding) {
    return (
      <HStack
        as="li"
        py="10px"
        px="4px"
        gap="8px"
        cursor="pointer"
        onClick={() => setAdding(true)}
      >
        <AddChipButton
          onClick={() => setAdding(true)}
          label="Add song"
          size={22}
        />
        <Text
          fontSize="13px"
          fontWeight="600"
          color="text"
          _hover={{ color: "ink" }}
        >
          Add song
        </Text>
      </HStack>
    );
  }

  return (
    <Box as="li" py="10px" px="4px" borderTop="1px dashed" borderColor="border">
      <HStack gap="10px" align="center">
        <chakra.input
          type="number"
          min={1}
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          w="52px"
          flexShrink="0"
          {...inputStyle}
        />
        <chakra.input
          type="text"
          placeholder="Song title"
          value={title}
          maxLength={255}
          onChange={(event) => setTitle(event.target.value)}
          flex="1"
          minW="0"
          {...inputStyle}
        />
        <chakra.input
          type="text"
          placeholder="M:SS"
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
          w="64px"
          flexShrink="0"
          {...inputStyle}
        />
        <chakra.button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          aria-label="Save song"
          title="Save song"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          boxSize="26px"
          flexShrink="0"
          bg="none"
          border="none"
          borderRadius="full"
          color="accent"
          cursor="pointer"
          _hover={{ bg: "border" }}
          _disabled={{ opacity: 0.5, cursor: "default" }}
        >
          <CheckIcon size={14} />
        </chakra.button>
        <chakra.button
          type="button"
          onClick={reset}
          disabled={submitting}
          aria-label="Cancel"
          title="Cancel"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          boxSize="26px"
          flexShrink="0"
          bg="none"
          border="none"
          borderRadius="full"
          color="text"
          cursor="pointer"
          _hover={{ bg: "border", color: "ink" }}
          _disabled={{ opacity: 0.5, cursor: "default" }}
        >
          <XIcon size={12} />
        </chakra.button>
      </HStack>
      {error && (
        <Text mt="6px" fontSize="12px" color="danger">
          {error}
        </Text>
      )}
    </Box>
  );
}

export default AddSongRow;
