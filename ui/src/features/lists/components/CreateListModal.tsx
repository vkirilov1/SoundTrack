import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Field,
  Flex,
  Input,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import Modal from "../../../components/Modal/Modal";
import ModalHeader from "../../../components/Modal/ModalHeader";
import ModalFormFooter from "../../../components/Modal/ModalFormFooter";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import AddChipButton from "../../../components/buttons/AddChipButton";
import AlbumGridRow from "../../../components/AlbumGridRow/AlbumGridRow";
import SearchFilterMenu from "../../search/components/SearchFilterMenu";
import type { SearchResult } from "../../search/types";
import { getAlbum } from "../../albums/api/albumApi";
import { addAlbumToList, createList } from "../../albums/api/listApi";
import { ApiError } from "../../../lib/api-error";
import type { AlbumDetail } from "../../../types/album";

interface CreateListModalProps {
  onClose: () => void;
}

function CreateListModal({ onClose }: CreateListModalProps) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [albums, setAlbums] = useState<AlbumDetail[]>([]);
  const [addingAlbum, setAddingAlbum] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pickerOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [pickerOpen]);

  const canSubmit = name.trim().length > 0 && !submitting;

  function handleSelectAlbum(result: SearchResult) {
    setPickerOpen(false);
    if (albums.some((a) => a.id === result.id)) return;

    setAddingAlbum(true);
    getAlbum(result.id)
      .then((detail) => setAlbums((prev) => [...prev, detail]))
      .catch(() => {})
      .finally(() => setAddingAlbum(false));
  }

  function handleRemoveAlbum(albumId: number) {
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
    return Promise.resolve();
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const created = await createList(name.trim());

      for (const album of albums) {
        await addAlbumToList(created.id, album.id);
      }

      onClose();
      navigate(`/list/${created.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't create the list.",
      );
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} maxW="560px">
      <chakra.form
        onSubmit={handleSubmit}
        noValidate
        display="flex"
        flexDirection="column"
        maxH="85vh"
      >
        <ModalHeader title="Create List" onClose={onClose} />

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

          <Box>
            <Flex align="center" justify="space-between" mb="8px">
              <Text m="0" fontSize="14px" fontWeight="500" color="ink">
                Albums (optional)
              </Text>
              <Box position="relative" ref={pickerRef}>
                <AddChipButton
                  onClick={() => setPickerOpen((prev) => !prev)}
                  label="Add album"
                />
                {pickerOpen && (
                  <SearchFilterMenu
                    categories={["albums"]}
                    onSelectMusic={handleSelectAlbum}
                  />
                )}
              </Box>
            </Flex>

            {addingAlbum && (
              <Text m="0 0 8px" fontSize="12px" color="text">
                Adding…
              </Text>
            )}

            {albums.length > 0 && (
              <chakra.ul listStyle="none" m="0" p="0">
                {albums.map((album) => (
                  <AlbumGridRow
                    key={album.id}
                    album={album}
                    rank={null}
                    isEditable
                    disableLinks
                    onRemove={() => handleRemoveAlbum(album.id)}
                  />
                ))}
              </chakra.ul>
            )}
          </Box>
        </VStack>

        <ModalFormFooter
          onCancel={onClose}
          canSubmit={canSubmit}
          submitting={submitting}
          submitLabel="Create list"
          submittingLabel="Creating…"
        />
      </chakra.form>
    </Modal>
  );
}

export default CreateListModal;
