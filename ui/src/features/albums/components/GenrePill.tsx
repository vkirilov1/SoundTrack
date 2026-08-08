import { Box, Link, chakra } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import XIcon from "../../../components/icons/XIcon";

interface GenrePillProps {
  genre: string;
  size: "primary" | "secondary";
  removable?: boolean;
  onRemove?: () => void;
}

function GenrePill({ genre, size, removable, onRemove }: GenrePillProps) {
  const isPrimary = size === "primary";
  const fontSize = isPrimary ? "13px" : "12px";
  const fontWeight = isPrimary ? "600" : undefined;

  if (!removable) {
    return (
      <Link
        asChild
        fontSize={fontSize}
        fontWeight={fontWeight}
        color={isPrimary ? "ink" : "text"}
        bg="border"
        opacity={isPrimary ? 1 : 0.7}
        px={isPrimary ? "14px" : "10px"}
        py={isPrimary ? "6px" : "4px"}
        borderRadius="full"
        textDecoration="none"
        _hover={{ bg: "accent", color: "white", opacity: 1 }}
      >
        <RouterLink to={`/genre/${encodeURIComponent(genre)}`}>
          {genre}
        </RouterLink>
      </Link>
    );
  }

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap="4px"
      bg="border"
      opacity={isPrimary ? 1 : 0.85}
      pl={isPrimary ? "14px" : "10px"}
      pr="6px"
      py={isPrimary ? "6px" : "4px"}
      borderRadius="full"
    >
      <Link
        asChild
        fontSize={fontSize}
        fontWeight={fontWeight}
        color="ink"
        textDecoration="none"
        _hover={{ color: "accent" }}
      >
        <RouterLink to={`/genre/${encodeURIComponent(genre)}`}>
          {genre}
        </RouterLink>
      </Link>
      <chakra.button
        type="button"
        onClick={onRemove}
        aria-label={`Remove genre ${genre}`}
        title={`Remove genre ${genre}`}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        boxSize="16px"
        flexShrink="0"
        bg="none"
        border="none"
        borderRadius="full"
        color="text"
        cursor="pointer"
        transition="background-color 0.15s ease, color 0.15s ease"
        _hover={{ color: "white", bg: "danger" }}
      >
        <XIcon size={9} />
      </chakra.button>
    </Box>
  );
}

export default GenrePill;
