import { useState, type SubmitEvent } from "react";
import { Field, Input, Text, Textarea, VStack, chakra } from "@chakra-ui/react";
import Modal from "../../../components/Modal/Modal";
import ModalHeader from "../../../components/Modal/ModalHeader";
import ModalFormFooter from "../../../components/Modal/ModalFormFooter";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import { suggestAlbum } from "../api/dropsApi";
import { ApiError } from "../../../lib/api-error";

interface SuggestAlbumModalProps {
  onClose: () => void;
}

function SuggestAlbumModal({ onClose }: SuggestAlbumModalProps) {
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    title.trim().length > 0 && artistName.trim().length > 0 && !submitting;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    suggestAlbum({
      title: title.trim(),
      artistName: artistName.trim(),
      releaseDate: releaseDate || null,
      note: note.trim() || null,
    })
      .then(() => setSubmitted(true))
      .catch((e: unknown) => {
        setError(
          e instanceof ApiError
            ? e.message
            : "Couldn't submit your suggestion.",
        );
        setSubmitting(false);
      });
  }

  if (submitted) {
    return (
      <Modal onClose={onClose} maxW="420px">
        <ModalHeader title="Suggest an Album" onClose={onClose} />
        <Text m="0" p="24px" fontSize="14px" color="ink" lineHeight="1.5">
          Thanks - an admin will review your suggestion shortly. You'll get a
          notification once it's decided.
        </Text>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} maxW="420px">
      <chakra.form onSubmit={handleSubmit} noValidate>
        <ModalHeader title="Suggest an Album" onClose={onClose} />

        <VStack align="stretch" gap="14px" p="24px">
          {error && <FormErrorBanner>{error}</FormErrorBanner>}

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Album title
            </Field.Label>
            <Input
              value={title}
              maxLength={255}
              onChange={(event) => setTitle(event.target.value)}
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Artist
            </Field.Label>
            <Input
              value={artistName}
              maxLength={255}
              onChange={(event) => setArtistName(event.target.value)}
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Release date (optional)
            </Field.Label>
            <Input
              type="date"
              value={releaseDate}
              onChange={(event) => setReleaseDate(event.target.value)}
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Note (optional)
            </Field.Label>
            <Textarea
              value={note}
              maxLength={500}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              minH="90px"
              maxH="280px"
              resize="vertical"
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>
        </VStack>

        <ModalFormFooter
          onCancel={onClose}
          canSubmit={canSubmit}
          submitting={submitting}
          submitLabel="Send suggestion"
          submittingLabel="Sending…"
        />
      </chakra.form>
    </Modal>
  );
}

export default SuggestAlbumModal;
