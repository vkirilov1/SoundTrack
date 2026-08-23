import { Box, Flex, Heading, Image, Text, chakra } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Avatar from "../../../components/Avatar/Avatar";
import StarRating from "../../../components/StarRating/StarRating";
import ImagePlaceholderIcon from "../../../components/icons/ImagePlaceholderIcon";
import { coverImageUrl, userPhotoUrl } from "../../../utils/images";
import { MONTH_DAY_FORMAT } from "../../../utils/date";
import type { FollowingReview } from "../types";

interface RecentFollowingReviewProps {
  review: FollowingReview;
}

function RecentFollowingReview({ review }: RecentFollowingReviewProps) {
  return (
    <Box as="section">
      <Heading as="h2" fontSize="18px" fontWeight="500" color="ink" m="0">
        <RouterLink to={`/profile/${review.reviewerId}`}>
          <chakra.span
            color="accent"
            fontWeight="700"
            _hover={{ color: "accentHover" }}
          >
            {review.reviewerUsername}
          </chakra.span>
        </RouterLink>
        , has recently reviewed “
        <RouterLink to={`/album/${review.albumId}`}>
          <chakra.span
            color="accent"
            fontWeight="700"
            _hover={{ color: "accentHover" }}
          >
            {review.albumTitle}
          </chakra.span>
        </RouterLink>
        ”:
      </Heading>

      <Flex
        asChild
        gap="16px"
        mt="16px"
        p="12px"
        borderRadius="lg"
        textDecoration="none"
        color="inherit"
        transition="background-color 0.15s ease"
        _hover={{ bg: "border" }}
      >
        <RouterLink to={`/album/${review.albumId}`}>
          {review.albumCoverUrl ? (
            <Image
              src={coverImageUrl(review.albumCoverUrl)}
              alt=""
              flexShrink="0"
              boxSize="88px"
              borderRadius="md"
              objectFit="cover"
              bg="border"
            />
          ) : (
            <Box
              flexShrink="0"
              boxSize="88px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              border="1.5px solid"
              borderColor="border"
              borderRadius="md"
              color="text"
              opacity="0.55"
            >
              <ImagePlaceholderIcon size={32} />
            </Box>
          )}

          <Box flex="1" minW="0">
            <Flex align="center" gap="8px" mb="4px">
              <Avatar
                src={userPhotoUrl(
                  review.reviewerProfilePicture ?? "userDefault.png",
                )}
                alt={review.reviewerUsername}
                size="22px"
              />
              <StarRating rating={review.rating} />
              <Text m="0" fontSize="12px" color="text" opacity="0.7">
                {MONTH_DAY_FORMAT.format(new Date(review.createdAt))}
              </Text>
            </Flex>
            <Text m="0" fontSize="15px" fontWeight="600" color="ink" truncate>
              {review.title}
            </Text>
            <Text m="0" mt="2px" fontSize="14px" color="text" lineClamp={2}>
              {review.comment}
            </Text>
          </Box>
        </RouterLink>
      </Flex>
    </Box>
  );
}

export default RecentFollowingReview;
