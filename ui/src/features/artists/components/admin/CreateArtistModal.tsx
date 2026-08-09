import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Field, Input, Textarea, VStack, chakra } from "@chakra-ui/react";
import Modal from "../../../../components/Modal/Modal";
import ModalHeader from "../../../../components/Modal/ModalHeader";
import ModalFormFooter from "../../../../components/Modal/ModalFormFooter";
import FormErrorBanner from "../../../../components/FormErrorBanner/FormErrorBanner";
import PhotoPickerField from "../../../edit-requests/components/PhotoPickerField";
import { ApiError } from "../../../../lib/api-error";
import {
  createArtist,
  uploadArtistPhoto,
} from "../../../edit-requests/api/adminContentApi";

interface CreateArtistModalProps {
  onClose: () => void;
}

function CreateArtistModal({ onClose }: CreateArtistModalProps) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("");
  const [biography, setBiography] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    name.trim().length > 0 &&
    country.trim().length > 0 &&
    type.trim().length > 0 &&
    photoFile !== null &&
    !submitting;

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const created = await createArtist({
        name: name.trim(),
        country: country.trim(),
        type: type.trim(),
        biography: biography.trim() || null,
      });

      if (photoFile) {
        await uploadArtistPhoto(created.id, photoFile);
      }

      navigate(`/artist/${created.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't create the artist.",
      );
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} maxW="520px">
      <chakra.form
        onSubmit={handleSubmit}
        noValidate
        display="flex"
        flexDirection="column"
        maxH="85vh"
      >
        <ModalHeader title="Add Artist" onClose={onClose} />

        <VStack align="stretch" gap="18px" p="24px" overflowY="auto">
          {error && <FormErrorBanner>{error}</FormErrorBanner>}

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Name
            </Field.Label>
            <Input
              value={name}
              maxLength={255}
              onChange={(event) => setName(event.target.value)}
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Country
            </Field.Label>
            <Input
              value={country}
              maxLength={2}
              onChange={(event) => setCountry(event.target.value)}
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Type
            </Field.Label>
            <Input
              value={type}
              maxLength={100}
              onChange={(event) => setType(event.target.value)}
              placeholder="e.g. Person, Group"
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Biography (optional)
            </Field.Label>
            <Textarea
              value={biography}
              maxLength={3400}
              onChange={(event) => setBiography(event.target.value)}
              rows={4}
              minH="90px"
              maxH="280px"
              resize="vertical"
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>

          <PhotoPickerField
            label="Artist photo"
            preview={photoPreview}
            onChange={handlePhotoChange}
          />
        </VStack>

        <ModalFormFooter
          onCancel={onClose}
          canSubmit={canSubmit}
          submitting={submitting}
          submitLabel="Create artist"
          submittingLabel="Creating…"
        />
      </chakra.form>
    </Modal>
  );
}

export default CreateArtistModal;
