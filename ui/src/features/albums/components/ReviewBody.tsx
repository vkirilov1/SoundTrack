import { HStack, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { SHORT_DATE_FORMAT } from "../../../utils/date";
import { userPhotoUrl } from "../../../utils/images";
import Avatar from "../../../components/Avatar/Avatar";
import type { AlbumReview } from "../types";

function ReviewBody({ review }: { review: AlbumReview }) {
  return (
    <>
      <HStack
        align="center"
        gap="8px"
        pb="10px"
        borderBottom="1px solid"
        borderColor="border"
      >
        <Avatar
          src={userPhotoUrl(review.profilePictureUrl ?? "userDefault.png")}
          alt=""
          size="24px"
        />
        <Text as="span" fontSize="14px" fontWeight="600" color="ink">
          <Link
            asChild
            color="accent"
            fontWeight="600"
            textDecoration="none"
            _hover={{ color: "accentHover" }}
          >
            <RouterLink to={`/profile/${review.userId}`}>
              {review.username}
            </RouterLink>
          </Link>
        </Text>
        <Text as="span" ml="auto" fontSize="12px" color="text" opacity="0.7">
          {SHORT_DATE_FORMAT.format(new Date(review.createdAt))}
        </Text>
      </HStack>
      <HStack mt="10px" align="baseline" gap="10px">
        <Text
          as="span"
          minW="0"
          fontSize="16px"
          fontWeight="700"
          color="ink"
          overflowWrap="break-word"
          wordBreak="break-word"
        >
          {review.title}
        </Text>
        <Text as="span" fontSize="15px" fontWeight="700" color="accent">
          {review.rating.toFixed(1)}/5
        </Text>
      </HStack>
      <Text
        mt="6px"
        fontSize="14px"
        lineHeight="1.6"
        color="text"
        overflowWrap="break-word"
        wordBreak="break-word"
      >
        {review.comment}
      </Text>
    </>
  );
}

export default ReviewBody;
