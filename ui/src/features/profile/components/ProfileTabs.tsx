import { useEffect, useState } from "react";
import { Box, HStack, Tabs, Text } from "@chakra-ui/react";
import { getUserLists, getUserReviews } from "../api/profileApi";
import ListsCard from "./ListsCard";
import ReviewsCard from "./ReviewsCard";
import FollowListCard from "./FollowListCard";

type ProfileTab = "lists" | "reviews" | "followers" | "following";

interface ProfileTabsProps {
  userId: number;
}

function ProfileTabs({ userId }: ProfileTabsProps) {
  const [currentTab, setCurrentTab] = useState<ProfileTab>("lists");
  const [listsCount, setListsCount] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    getUserLists(userId, 0, 1)
      .then((res) => {
        if (!cancelled) setListsCount(res.totalElements);
      })
      .catch(() => {});

    getUserReviews(userId, 0, 1)
      .then((res) => {
        if (!cancelled) setReviewsCount(res.totalElements);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <Tabs.Root
      value={currentTab}
      onValueChange={(details) => setCurrentTab(details.value as ProfileTab)}
      variant="line"
      lazyMount
      unmountOnExit
      mt="32px"
    >
      <Tabs.List justifyContent="center" gap="32px" borderColor="border">
        <Tabs.Trigger
          value="lists"
          fontSize="15px"
          color="text"
          px="4px"
          py="8px"
          pb="14px"
          cursor="pointer"
          _selected={{
            color: "ink",
            fontWeight: "600",
            "--indicator-color": "var(--chakra-colors-accent)",
          }}
        >
          <HStack gap="4px" align="baseline">
            <span>Lists</span>
            {listsCount !== null && (
              <Text
                as="span"
                fontSize="10px"
                fontWeight="400"
                marginInlineStart={0.5}
                color="text"
                opacity="0.7"
              >
                {listsCount}
              </Text>
            )}
          </HStack>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="reviews"
          fontSize="15px"
          color="text"
          px="4px"
          py="8px"
          pb="14px"
          cursor="pointer"
          _selected={{
            color: "ink",
            fontWeight: "600",
            "--indicator-color": "var(--chakra-colors-accent)",
          }}
        >
          <HStack gap="4px" align="baseline">
            <span>Reviews</span>
            {reviewsCount !== null && (
              <Text
                as="span"
                fontSize="10px"
                fontWeight="400"
                marginInlineStart={0.5}
                color="text"
                opacity="0.7"
              >
                {reviewsCount}
              </Text>
            )}
          </HStack>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="followers"
          fontSize="15px"
          color="text"
          px="4px"
          py="8px"
          pb="14px"
          cursor="pointer"
          _selected={{
            color: "ink",
            fontWeight: "600",
            "--indicator-color": "var(--chakra-colors-accent)",
          }}
        >
          Followers
        </Tabs.Trigger>
        <Tabs.Trigger
          value="following"
          fontSize="15px"
          color="text"
          px="4px"
          py="8px"
          pb="14px"
          cursor="pointer"
          _selected={{
            color: "ink",
            fontWeight: "600",
            "--indicator-color": "var(--chakra-colors-accent)",
          }}
        >
          Following
        </Tabs.Trigger>
      </Tabs.List>

      <Box mt="32px" display="flex" justifyContent="center">
        <Box w="100%" maxW="600px" minW="0">
          <Tabs.Content value="lists">
            <ListsCard userId={userId} />
          </Tabs.Content>
          <Tabs.Content value="reviews">
            <ReviewsCard userId={userId} />
          </Tabs.Content>
          <Tabs.Content value="followers">
            <FollowListCard userId={userId} mode="followers" />
          </Tabs.Content>
          <Tabs.Content value="following">
            <FollowListCard userId={userId} mode="following" />
          </Tabs.Content>
        </Box>
      </Box>
    </Tabs.Root>
  );
}

export default ProfileTabs;
