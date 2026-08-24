import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { Box, Heading, HStack, Link, Text, chakra } from "@chakra-ui/react";
import PageContainer from "../../../components/PageContainer/PageContainer";
import PageStatus from "../../../components/PageStatus/PageStatus";
import PagedSection from "../../../components/PagedSection/PagedSection";
import AlbumGridRow from "../../../components/AlbumGridRow/AlbumGridRow";
import ConfirmDeleteControl from "../../../components/ConfirmDeleteControl/ConfirmDeleteControl";
import EditIconButton from "../../../components/buttons/EditIconButton";
import AddChipButton from "../../../components/buttons/AddChipButton";
import InlineTextEditForm from "../../edit-requests/components/InlineTextEditForm";
import SearchFilterMenu from "../../search/components/SearchFilterMenu";
import type { SearchResult } from "../../search/types";
import { getAlbum } from "../../albums/api/albumApi";
import {
  addAlbumToList,
  deleteList,
  getList,
  removeAlbumFromList,
  updateListDescription,
  updateListName,
} from "../../albums/api/listApi";
import { useAuth } from "../../auth/stores/useAuth";
import { ApiError } from "../../../lib/api-error";
import { SHORT_DATE_FORMAT } from "../../../utils/date";
import type { UserListDetail } from "../../../types/list";

function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const id = Number(listId);
  const invalidId = !Number.isFinite(id);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState<UserListDetail | null>(null);
  const [loading, setLoading] = useState(() => !invalidId);
  const [notFound, setNotFound] = useState(() => invalidId);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addingAlbum, setAddingAlbum] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    getList(id)
      .then((res) => {
        if (cancelled) return;
        setList(res);
        setNotFound(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, invalidId]);

  function handleRemoveAlbum(albumId: number) {
    return removeAlbumFromList(id, albumId).then(() => {
      setList((prev) =>
        prev
          ? { ...prev, albums: prev.albums.filter((a) => a.id !== albumId) }
          : prev,
      );
    });
  }

  function handleSelectAlbum(result: SearchResult) {
    setPickerOpen(false);
    if (list?.albums.some((a) => a.id === result.id)) return;

    setAddingAlbum(true);
    addAlbumToList(id, result.id)
      .then(() => getAlbum(result.id))
      .then((detail) => {
        setList((prev) =>
          prev ? { ...prev, albums: [...prev.albums, detail] } : prev,
        );
      })
      .catch(() => {})
      .finally(() => setAddingAlbum(false));
  }

  function handleDeleteList() {
    return deleteList(id).then(() => {
      navigate(`/profile/${list?.ownerId}`);
    });
  }

  async function handleSaveName(name: string) {
    const updated = await updateListName(id, name, list?.description ?? null);
    setList((prev) => (prev ? { ...prev, name: updated.name } : prev));
  }

  async function handleSaveDescription(text: string) {
    const updated = await updateListDescription(id, list?.name ?? "", text);
    setList((prev) =>
      prev ? { ...prev, description: updated.description } : prev,
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <PageStatus variant="loading" />
      </PageContainer>
    );
  }

  if (notFound || !list) {
    return (
      <PageContainer>
        <PageStatus variant="not-found" message="This list doesn't exist." />
      </PageContainer>
    );
  }

  const isOwner = currentUser?.id === list.ownerId;

  return (
    <PageContainer>
      <HStack justify="space-between" align="flex-start" gap="16px">
        <HStack flex="1" minW="0" align="center" gap="6px" flexWrap="wrap">
          {!editingName && (
            <Heading
              as="h1"
              fontSize="28px"
              color="accent"
              m="0"
              minW="0"
              overflowWrap="break-word"
              wordBreak="break-word"
            >
              {list.name}
            </Heading>
          )}
          {isOwner && (
            <InlineTextEditForm
              currentText={list.name}
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
                <EditIconButton onClick={open} label="Edit list name" />
              )}
            />
          )}
        </HStack>
        {isOwner && (
          <Box flexShrink="0" mt="4px">
            <ConfirmDeleteControl
              label="Delete list"
              confirmMessage="Delete this list?"
              onDelete={handleDeleteList}
            />
          </Box>
        )}
      </HStack>

      <Text mt="4px" fontSize="14px" color="text">
        by{" "}
        <Link
          asChild
          color="ink"
          fontWeight="600"
          textDecoration="none"
          _hover={{ color: "accentHover" }}
        >
          <RouterLink to={`/profile/${list.ownerId}`}>
            {list.ownerUsername}
          </RouterLink>
        </Link>
      </Text>

      {(list.description || isOwner) && (
        <HStack mt="5px" align="flex-start" gap="6px" flexWrap="wrap">
          {!editingDescription && list.description && (
            <Text
              minW="0"
              maxW="100%"
              color="ink"
              m="0"
              overflowWrap="break-word"
              wordBreak="break-word"
            >
              {list.description}
            </Text>
          )}
          {isOwner && (
            <InlineTextEditForm
              currentText={list.description ?? ""}
              onSubmit={handleSaveDescription}
              onEditingChange={setEditingDescription}
              variant="textarea"
              maxLength={1024}
              submitLabel="Save"
              submittingLabel="Saving…"
              errorFallback="Couldn't save the description."
              renderTrigger={(open) => (
                <EditIconButton
                  onClick={open}
                  label="Edit description"
                  size={13}
                />
              )}
            />
          )}
        </HStack>
      )}

      <Text mt="5px" fontSize="13px" color="text" opacity="0.7">
        Created {SHORT_DATE_FORMAT.format(new Date(list.createdAt))}
      </Text>

      <Box mt="20px" borderBottom="1px solid" borderColor="border" />

      <Box mt="24px">
        <PagedSection
          loading={false}
          listLoading={false}
          isEmpty={list.albums.length === 0}
          emptyMessage="This list is empty."
          spinnerLabel="Loading list"
        >
          <chakra.ul listStyle="none" m="0" p="0">
            {list.albums.map((album) => (
              <AlbumGridRow
                key={album.id}
                album={album}
                rank={null}
                isEditable={isOwner}
                onRemove={() => handleRemoveAlbum(album.id)}
              />
            ))}
          </chakra.ul>
        </PagedSection>
      </Box>

      {isOwner && (
        <Box
          mt="20px"
          pt="20px"
          borderTop={list.albums.length > 0 ? "1px solid" : "none"}
          borderColor="border"
          textAlign="center"
        >
          <Box position="relative" display="inline-block" ref={pickerRef}>
            <AddChipButton
              onClick={() => setPickerOpen((prev) => !prev)}
              label="Add album to list"
              size={36}
            />
            {pickerOpen && (
              <SearchFilterMenu
                categories={["albums"]}
                onSelectMusic={handleSelectAlbum}
                align="left"
              />
            )}
          </Box>
          {addingAlbum && (
            <Text mt="8px" fontSize="12px" color="text">
              Adding…
            </Text>
          )}
        </Box>
      )}
    </PageContainer>
  );
}

export default ListPage;
