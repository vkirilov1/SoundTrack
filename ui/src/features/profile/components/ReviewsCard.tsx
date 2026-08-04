import { useCallback } from "react";
import { Box, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { getUserReviews } from "../api/profileApi";
import Pagination from "../../../components/Pagination/Pagination";
import PagedSection from "../../../components/PagedSection/PagedSection";
import StarRating from "../../../components/StarRating/StarRating";
import { useAuth } from "../../auth/stores/useAuth";
import { usePagedList } from "../../../hooks/usePagedList";
import { MONTH_YEAR_FORMAT } from "../../../utils/date";
import AdminReviewDeleteControl from "../../edit-requests/components/AdminReviewDeleteControl";

interface ReviewsCardProps {
  userId: number;
}

function ReviewsCard({ userId }: ReviewsCardProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const invalidId = !Number.isFinite(userId);

  const fetchReviews = useCallback(
    (page: number) => getUserReviews(userId, page),
    [userId],
  );
  const {
    items: reviews,
    setItems: setReviews,
    page,
    totalPages,
    loading,
    listLoading,
    goToPage,
  } = usePagedList(fetchReviews, { enabled: !invalidId });

  function handleAdminReviewDeleted(reviewId: number) {
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
  }

  return (
    <>
      <PagedSection
        loading={loading}
        listLoading={listLoading}
        isEmpty={reviews.length === 0}
        emptyMessage="No reviews yet."
        spinnerLabel="Loading reviews"
      >
        <VStack
          as="ul"
          listStyle="none"
          m="0"
          mt="16px"
          p="0"
          gap="20px"
          align="stretch"
        >
          {reviews.map((review) => (
            <Box
              as="li"
              key={review.id}
              display="flex"
              flexDirection="column"
              gap="4px"
              pb="20px"
              borderBottom="1px solid"
              borderColor="border"
              _last={{ pb: 0, borderBottom: "none" }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="12px"
              >
                <Text
                  as="span"
                  minW="0"
                  fontSize="15px"
                  fontWeight="600"
                  color="ink"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {review.title}
                </Text>
                <VStack flexShrink="0" align="flex-end" gap="2px">
                  <StarRating rating={review.rating} />
                  <Text
                    as="span"
                    fontSize="11px"
                    lineHeight="1.3"
                    color="text"
                    opacity="0.7"
                    whiteSpace="nowrap"
                  >
                    {MONTH_YEAR_FORMAT.format(new Date(review.createdAt))}
                  </Text>
                </VStack>
              </Box>
              <Text as="span" fontSize="13px" fontWeight="500" color="accent">
                <Link
                  asChild
                  color="inherit"
                  textDecoration="none"
                  _hover={{ color: "accentHover" }}
                >
                  <RouterLink to={`/album/${review.albumId}`}>
                    {review.albumTitle}
                  </RouterLink>
                </Link>
              </Text>
              <Text
                mt="2px"
                fontSize="14px"
                lineHeight="1.5"
                color="text"
                lineClamp={3}
              >
                {review.comment}
              </Text>
              {isAdmin && (
                <Box mt="6px">
                  <AdminReviewDeleteControl
                    reviewId={review.id}
                    onDeleted={handleAdminReviewDeleted}
                  />
                </Box>
              )}
            </Box>
          ))}
        </VStack>
      </PagedSection>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </>
  );
}

export default ReviewsCard;
