import { useState, type RefObject } from "react";
import type { SubmitEvent } from "react";
import { chakra, HStack, Text } from "@chakra-ui/react";
import { ApiError } from "../../../lib/api-error";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import SecondaryButton from "../../../components/buttons/SecondaryButton";
import type { AlbumReview, CreateAlbumReviewRequest } from "../types";
import RatingPicker from "./RatingPicker";

const MIN_COMMENT_LENGTH = 200;

interface ReviewFormProps {
  commentInputRef: RefObject<HTMLTextAreaElement | null>;
  /** Pre-fills the form when editing an existing review; omitted for a new one. */
  initialReview?: AlbumReview | null;
  isEditing: boolean;
  onSubmit: (payload: CreateAlbumReviewRequest) => Promise<AlbumReview>;
  onSaved: (review: AlbumReview) => void;
  onCancel?: () => void;
}

function ReviewForm({
  commentInputRef,
  initialReview,
  isEditing,
  onSubmit,
  onSaved,
  onCancel,
}: ReviewFormProps) {
  const [title, setTitle] = useState(initialReview?.title ?? "");
  const [rating, setRating] = useState<number | null>(
    initialReview?.rating ?? null,
  );
  const [comment, setComment] = useState(initialReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (rating === null) {
      setFormError("Pick a rating from 0 to 5 stars.");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedComment = comment.trim();

    if (!trimmedTitle || !trimmedComment) {
      setFormError("Title and comment can't be empty.");
      return;
    }
    if (trimmedComment.length < MIN_COMMENT_LENGTH) {
      setFormError(
        `Comment must be at least ${MIN_COMMENT_LENGTH} characters (currently ${trimmedComment.length}).`,
      );
      return;
    }

    setSubmitting(true);

    try {
      const saved = await onSubmit({
        rating,
        title: trimmedTitle,
        comment: trimmedComment,
      });
      onSaved(saved);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Couldn't post your review.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const commentLength = comment.trim().length;

  return (
    <chakra.form onSubmit={handleSubmit} mt="16px">
      <HStack align="center" justify="space-between" gap="16px" mb="8px">
        <chakra.input
          type="text"
          placeholder="Title"
          value={title}
          maxLength={255}
          onChange={(event) => setTitle(event.target.value)}
          flex="1"
          minW="0"
          font="inherit"
          fontSize="14px"
          fontWeight="600"
          color="ink"
          bg="none"
          border="none"
          borderBottom="1px solid"
          borderColor="border"
          px="2px"
          py="6px"
          outline="none"
          _focus={{ borderColor: "accent" }}
          css={{
            "&::placeholder": {
              fontWeight: 400,
              color: "var(--chakra-colors-text)",
              opacity: 0.7,
            },
          }}
        />
        <RatingPicker value={rating} onChange={setRating} />
      </HStack>
      <chakra.textarea
        ref={commentInputRef}
        placeholder="Drop a thought..."
        value={comment}
        maxLength={3400}
        onChange={(event) => setComment(event.target.value)}
        display="block"
        w="100%"
        minH="96px"
        maxH="240px"
        resize="vertical"
        font="inherit"
        fontSize="14px"
        color="ink"
        bg="bg"
        border="1px solid"
        borderColor="border"
        borderRadius="md"
        px="14px"
        py="12px"
        outline="none"
        _focus={{ borderColor: "accent" }}
        css={{
          "&::placeholder": {
            color: "var(--chakra-colors-text)",
            opacity: 0.7,
          },
        }}
      />
      <HStack mt="6px" justify="flex-end">
        <Text
          fontSize="12px"
          color={commentLength < MIN_COMMENT_LENGTH ? "danger" : "text"}
          opacity={commentLength < MIN_COMMENT_LENGTH ? undefined : "0.7"}
        >
          {commentLength}/{MIN_COMMENT_LENGTH} minimum
        </Text>
      </HStack>
      {formError && (
        <Text mt="8px" fontSize="13px" color="danger">
          {formError}
        </Text>
      )}
      <HStack mt="12px" justify="flex-end" gap="10px">
        {isEditing && (
          <SecondaryButton onClick={onCancel} disabled={submitting}>
            Cancel
          </SecondaryButton>
        )}
        <PrimaryButton
          type="submit"
          disabled={submitting}
          fontSize="13px"
          px="28px"
          py="10px"
          h="auto"
        >
          {submitting ? "Posting…" : isEditing ? "Save" : "Post"}
        </PrimaryButton>
      </HStack>
    </chakra.form>
  );
}

export default ReviewForm;
