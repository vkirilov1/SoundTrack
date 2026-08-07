import { useCallback, useEffect, useState, type RefObject } from "react";
import { Box, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  createAlbumReview,
  deleteAlbumReview,
  getAlbumReviews,
  getMyReview,
  updateAlbumReview,
} from "../api/reviewApi";
import Pagination from "../../../components/Pagination/Pagination";
import PagedSection from "../../../components/PagedSection/PagedSection";
import Spinner from "../../../components/Spinner/Spinner";
import { useAuth } from "../../../features/auth/stores/useAuth";
import { usePagedList } from "../../../hooks/usePagedList";
import AdminReviewDeleteControl from "../../edit-requests/components/AdminReviewDeleteControl";
import type { AlbumReview } from "../types";
import MyReviewCard from "./MyReviewCard";
import ReviewBody from "./ReviewBody";
import ReviewForm from "./ReviewForm";

interface ReviewsSectionProps {
  albumId: number;
  commentInputRef: RefObject<HTMLTextAreaElement | null>;
  onReviewPosted: () => void;
}

function ReviewsSection({
  albumId,
  commentInputRef,
  onReviewPosted,
}: ReviewsSectionProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const fetchReviews = useCallback(
    (page: number) => getAlbumReviews(albumId, page),
    [albumId],
  );
  const {
    items: reviews,
    setItems: setReviews,
    page,
    totalPages,
    loading,
    listLoading,
    goToPage,
    reload,
  } = usePagedList(fetchReviews);

  const [myReview, setMyReview] = useState<AlbumReview | null>(null);
  const [myReviewLoading, setMyReviewLoading] = useState(true);
  const [isEditingMyReview, setIsEditingMyReview] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;

    getMyReview(albumId)
      .then((review) => {
        if (cancelled) return;
        setMyReview(review);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setMyReviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [albumId, currentUser]);

  function handleReviewSaved(saved: AlbumReview) {
    setMyReview(saved);
    setIsEditingMyReview(false);
    reload()
      .then(() => onReviewPosted())
      .catch(() => {});
  }

  function handleDeleteMyReview() {
    if (!myReview) return Promise.resolve();

    return deleteAlbumReview(albumId, myReview.id).then(() => {
      setMyReview(null);
      return reload().then(() => onReviewPosted());
    });
  }

  function handleAdminReviewDeleted(reviewId: number) {
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    onReviewPosted();
  }

  const otherReviews = myReview
    ? reviews.filter((review) => review.id !== myReview.id)
    : reviews;

  return (
    <Box as="section" mt="40px">
      <Heading as="h2" fontSize="22px">
        Reviews
      </Heading>

      {!currentUser ? (
        <Text mt="16px" fontSize="14px" color="text">
          <Link
            asChild
            color="accent"
            fontWeight="600"
            textDecoration="none"
            _hover={{ color: "accentHover" }}
          >
            <RouterLink to="/login">Log in</RouterLink>
          </Link>{" "}
          to write a review.
        </Text>
      ) : isAdmin ? null : myReviewLoading ? (
        <HStack mt="16px" justify="center" py="12px">
          <Spinner size={20} label="Loading your review" />
        </HStack>
      ) : myReview && !isEditingMyReview ? (
        <MyReviewCard
          review={myReview}
          onEdit={() => setIsEditingMyReview(true)}
          onDelete={handleDeleteMyReview}
        />
      ) : (
        <ReviewForm
          commentInputRef={commentInputRef}
          initialReview={isEditingMyReview ? myReview : null}
          isEditing={isEditingMyReview}
          onSubmit={(payload) =>
            myReview && isEditingMyReview
              ? updateAlbumReview(albumId, myReview.id, payload)
              : createAlbumReview(albumId, payload)
          }
          onSaved={handleReviewSaved}
          onCancel={() => setIsEditingMyReview(false)}
        />
      )}

      {/* No emptyMessage here — AlbumCard already prompts to write the first review. */}
      <PagedSection
        loading={loading}
        listLoading={listLoading}
        isEmpty={otherReviews.length === 0}
        spinnerLabel="Loading reviews"
      >
        <VStack mt="28px" align="stretch" gap="28px">
          {otherReviews.map((review) => (
            <Box
              as="article"
              key={review.id}
              display="flex"
              flexDirection="column"
              {...(review.followedAuthor && {
                bg: "rgba(247, 164, 63, 0.07)",
                borderLeft: "3px solid",
                borderColor: "accent",
                pl: "14px",
                pr: "14px",
                py: "6px",
                borderRadius: "4px",
              })}
            >
              <ReviewBody review={review} />
              {isAdmin && (
                <HStack mt="10px" align="center" gap="10px">
                  <AdminReviewDeleteControl
                    reviewId={review.id}
                    onDeleted={handleAdminReviewDeleted}
                  />
                </HStack>
              )}
            </Box>
          ))}
        </VStack>
      </PagedSection>

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </Box>
  );
}

export default ReviewsSection;
