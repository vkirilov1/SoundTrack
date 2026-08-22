import { Fragment, useState } from "react";
import { Box, HStack, Image, Text } from "@chakra-ui/react";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import ConfirmDeleteControl from "../../../components/ConfirmDeleteControl/ConfirmDeleteControl";
import ConfirmActionModal from "../../../components/Modal/ConfirmActionModal";
import PillButton from "../../../components/buttons/PillButton";
import { coverImageUrl } from "../../../utils/images";
import { SHORT_DATE_FORMAT } from "../../../utils/date";
import type { UpcomingRelease } from "../types";

function CoverPlaceholder() {
  return (
    <Box
      as="span"
      aria-hidden="true"
      flexShrink="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxSize="72px"
      border="1.5px solid"
      borderColor="border"
      borderRadius="md"
      color="text"
      opacity="0.55"
    >
      <ImagePlaceholderIcon size={28} />
    </Box>
  );
}

interface UpcomingReleaseRowProps {
  release: UpcomingRelease;
  isAdmin: boolean;
  onPublish: (id: number) => Promise<void>;
  onCancel: (id: number) => Promise<unknown>;
}

function UpcomingReleaseRow({
  release,
  isAdmin,
  onPublish,
  onCancel,
}: UpcomingReleaseRowProps) {
  const [confirmingPublish, setConfirmingPublish] = useState(false);

  return (
    <HStack
      as="li"
      gap="20px"
      py="16px"
      px="4px"
      borderBottom="1px solid"
      borderColor="border"
      _last={{ borderBottom: "none" }}
    >
      {release.coverUrl ? (
        <Image
          src={coverImageUrl(release.coverUrl)}
          alt=""
          flexShrink="0"
          boxSize="72px"
          borderRadius="md"
          objectFit="cover"
          bg="border"
        />
      ) : (
        <CoverPlaceholder />
      )}

      <Box flex="1" minW="0" display="flex" flexDirection="column" gap="2px">
        <Text
          m="0"
          fontSize="17px"
          fontWeight="600"
          color="ink"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {release.title}
        </Text>
        <Text m="0" fontSize="14px" color="text" opacity="0.85">
          {release.artistNames.map((name, index) => (
            <Fragment key={name}>
              {index > 0 && ", "}
              {name}
            </Fragment>
          ))}
        </Text>
        <Text m="0" fontSize="13px" color="text" opacity="0.7">
          Releases {SHORT_DATE_FORMAT.format(new Date(release.releaseDate))}
        </Text>
      </Box>

      {isAdmin && (
        <HStack flexShrink="0" gap="10px">
          <PillButton
            onClick={() => setConfirmingPublish(true)}
            disabled={!release.publishable}
            muted={!release.publishable}
            fontSize="12px"
            px="14px"
            py="6px"
            title={
              release.publishable
                ? undefined
                : "Available once the release date arrives"
            }
          >
            Publish
          </PillButton>
          <ConfirmDeleteControl
            label="Cancel"
            confirmMessage="Cancel this release?"
            onDelete={() => onCancel(release.id)}
          />
        </HStack>
      )}

      {confirmingPublish && (
        <ConfirmActionModal
          title="Publish Release"
          message={`"${release.title}" will be added to the catalog and become visible everywhere - ratings, reviews, favorites, and lists will all open up.`}
          confirmLabel="Publish"
          confirmingLabel="Publishing…"
          onConfirm={() => onPublish(release.id)}
          onClose={() => setConfirmingPublish(false)}
        />
      )}
    </HStack>
  );
}

export default UpcomingReleaseRow;
