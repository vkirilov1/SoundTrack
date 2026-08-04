import { useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import ConfirmDeleteControl from "../../../components/ConfirmDeleteControl/ConfirmDeleteControl";
import TextButton from "../../../components/buttons/TextButton";
import type { AlbumReview } from "../types";
import ReviewBody from "./ReviewBody";

interface MyReviewCardProps {
  review: AlbumReview;
  onEdit: () => void;
  onDelete: () => Promise<unknown>;
}

function MyReviewCard({ review, onEdit, onDelete }: MyReviewCardProps) {
  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "confirming" | "deleting"
  >("idle");

  return (
    <Box
      mt="16px"
      p="16px"
      bg="bg"
      border="1px solid"
      borderColor="accent"
      borderRadius="md"
    >
      <ReviewBody review={review} />
      <HStack mt="14px" align="center" gap="10px">
        {deleteStatus === "idle" && (
          <TextButton onClick={onEdit}>Edit</TextButton>
        )}
        <ConfirmDeleteControl
          confirmMessage="Delete this review?"
          onDelete={onDelete}
          onStatusChange={setDeleteStatus}
        />
      </HStack>
    </Box>
  );
}

export default MyReviewCard;
