import { useState, type SubmitEvent } from "react";
import {
  Box,
  Field,
  Flex,
  Image,
  Input,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import Modal from "../../../components/Modal/Modal";
import ModalHeader from "../../../components/Modal/ModalHeader";
import ModalFormFooter from "../../../components/Modal/ModalFormFooter";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import TextButton from "../../../components/buttons/TextButton";
import SearchResultRow from "../../search/components/SearchResultRow";
import {
  useDebouncedSearch,
  MIN_QUERY_LENGTH,
} from "../../search/hooks/useDebouncedSearch";
import type { SearchResult } from "../../search/types";
import { artistImageUrl, coverImageUrl } from "../../../utils/images";
import { ApiError } from "../../../lib/api-error";
import { useChat } from "../stores/useChat";

function resultImage(result: SearchResult): string | null {
  if (!result.imageUrl) return null;
  return result.type === "ALBUM"
    ? coverImageUrl(result.imageUrl)
    : artistImageUrl(result.imageUrl);
}

interface CreateRoomModalProps {
  onClose: () => void;
}

/**
 * Create-room form: name, an album/artist topic picked via the shared search rows, and whether
 * joining needs the owner's approval. On success the dock opens with the new room.
 */
function CreateRoomModal({ onClose }: CreateRoomModalProps) {
  const { createRoom } = useChat();

  const [name, setName] = useState("");
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<SearchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { musicResults, loading, reset } = useDebouncedSearch(query, "music");

  const canSubmit = name.trim().length >= 3 && topic !== null && !submitting;

  const trimmedQuery = query.trim();
  const searching = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const hasResults =
    musicResults.albums.length > 0 || musicResults.artists.length > 0;

  function handleSelect(result: SearchResult) {
    setTopic(result);
    setQuery("");
    reset();
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !topic) return;

    setSubmitting(true);
    setError(null);

    try {
      await createRoom({
        name: name.trim(),
        topicType: topic.type,
        topicId: topic.id,
        approvalRequired,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't create the chat room.",
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
        <ModalHeader title="Create Chat Room" onClose={onClose} />

        <VStack align="stretch" gap="18px" p="24px" overflowY="auto">
          {error && <FormErrorBanner>{error}</FormErrorBanner>}

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Room name*
            </Field.Label>
            <Input
              value={name}
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
              borderColor="border"
              _focus={{ borderColor: "accent" }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Topic*
            </Field.Label>

            {topic ? (
              <Flex
                align="center"
                gap="10px"
                w="100%"
                px="10px"
                py="8px"
                border="1px solid"
                borderColor="border"
                borderRadius="md"
              >
                <Box
                  flexShrink="0"
                  boxSize="36px"
                  borderRadius="md"
                  overflow="hidden"
                  bg="border"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="text"
                >
                  {resultImage(topic) ? (
                    <Image
                      src={resultImage(topic)!}
                      alt={topic.title}
                      boxSize="36px"
                      objectFit="cover"
                    />
                  ) : (
                    <ImagePlaceholderIcon size={18} />
                  )}
                </Box>
                <Box flex="1" minW="0">
                  <Text
                    m="0"
                    fontSize="13px"
                    fontWeight="600"
                    color="ink"
                    truncate
                  >
                    {topic.title}
                  </Text>
                  <Text m="0" fontSize="11px" color="text">
                    {topic.type === "ALBUM" ? "Album" : "Artist"}
                    {topic.subtitle ? ` · ${topic.subtitle}` : ""}
                  </Text>
                </Box>
                <TextButton onClick={() => setTopic(null)}>Change</TextButton>
              </Flex>
            ) : (
              <>
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search albums and artists"
                  borderColor="border"
                  _focus={{ borderColor: "accent" }}
                />

                {searching && (
                  <Box
                    w="100%"
                    mt="6px"
                    maxH="240px"
                    overflowY="auto"
                    border="1px solid"
                    borderColor="border"
                    borderRadius="md"
                    p="8px"
                  >
                    {loading ? (
                      <Text
                        m="0"
                        py="12px"
                        textAlign="center"
                        fontSize="13px"
                        color="text"
                      >
                        Searching…
                      </Text>
                    ) : hasResults ? (
                      <VStack align="stretch" gap="12px">
                        {musicResults.albums.length > 0 && (
                          <Box>
                            <Text
                              display="block"
                              px="6px"
                              pb="6px"
                              fontSize="11px"
                              fontWeight="600"
                              textTransform="uppercase"
                              letterSpacing="0.5px"
                              color="text"
                              opacity="0.7"
                            >
                              Albums
                            </Text>
                            {musicResults.albums.map((result) => (
                              <SearchResultRow
                                key={`album-${result.id}`}
                                result={result}
                                onSelect={handleSelect}
                              />
                            ))}
                          </Box>
                        )}
                        {musicResults.artists.length > 0 && (
                          <Box>
                            <Text
                              display="block"
                              px="6px"
                              pb="6px"
                              fontSize="11px"
                              fontWeight="600"
                              textTransform="uppercase"
                              letterSpacing="0.5px"
                              color="text"
                              opacity="0.7"
                            >
                              Artists
                            </Text>
                            {musicResults.artists.map((result) => (
                              <SearchResultRow
                                key={`artist-${result.id}`}
                                result={result}
                                onSelect={handleSelect}
                              />
                            ))}
                          </Box>
                        )}
                      </VStack>
                    ) : (
                      <Text
                        m="0"
                        py="12px"
                        textAlign="center"
                        fontSize="13px"
                        color="text"
                      >
                        No results for &ldquo;{trimmedQuery}&rdquo;
                      </Text>
                    )}
                  </Box>
                )}
              </>
            )}
          </Field.Root>

          <Flex as="label" align="center" gap="8px" cursor="pointer">
            <chakra.input
              type="checkbox"
              checked={approvalRequired}
              onChange={(event) => setApprovalRequired(event.target.checked)}
              accentColor="var(--chakra-colors-accent)"
            />
            <Text m="0" fontSize="13px" color="ink">
              Require my approval before someone can join
            </Text>
          </Flex>
        </VStack>

        <ModalFormFooter
          onCancel={onClose}
          canSubmit={canSubmit}
          submitting={submitting}
          submitLabel="Create room"
          submittingLabel="Creating…"
        />
      </chakra.form>
    </Modal>
  );
}

export default CreateRoomModal;
