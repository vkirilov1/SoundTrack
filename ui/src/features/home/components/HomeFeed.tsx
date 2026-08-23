import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Heading, Link, Text, VStack, chakra } from "@chakra-ui/react";
import PageContainer from "../../../components/PageContainer/PageContainer";
import Spinner from "../../../components/Spinner/Spinner";
import { useAuth } from "../../auth/stores/useAuth";
import { getHomeFeed } from "../api/homeApi";
import type { HomeFeed as HomeFeedData } from "../types";
import FeedSectionCard from "./FeedSectionCard";
import StatsStrip from "./StatsStrip";
import RecentFollowingReview from "./RecentFollowingReview";
import ActiveRoomSection from "./ActiveRoomSection";
import SuggestedRoomsSection from "./SuggestedRoomsSection";
import TrendingSection from "./TrendingSection";
import GenrePickSection from "./GenrePickSection";

function HomeFeed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<HomeFeedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getHomeFeed()
      .then((data) => {
        if (!cancelled) setFeed(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;

  return (
    <PageContainer>
      <Heading as="h1" fontSize="28px" m="0">
        Welcome, <chakra.span color="accent">{user.username}</chakra.span>!
      </Heading>

      <Text
        m="0"
        mt="10px"
        mb="32px"
        fontSize="16px"
        color="text"
        lineHeight="1.6"
      >
        Something on your mind? Start a new{" "}
        <Link
          asChild
          color="accent"
          fontWeight="700"
          textDecoration="none"
          _hover={{ color: "accentHover" }}
        >
          <RouterLink to="/chats">chat</RouterLink>
        </Link>
        ! Check out what&rsquo;s{" "}
        <Link
          asChild
          color="accent"
          fontWeight="700"
          textDecoration="none"
          _hover={{ color: "accentHover" }}
        >
          <RouterLink to="/drops">new</RouterLink>
        </Link>
        .
      </Text>

      {loading || !feed ? (
        <VStack py="60px">
          <Spinner label="Loading your feed" />
        </VStack>
      ) : (
        <VStack align="stretch" gap="20px">
          <FeedSectionCard>
            <StatsStrip stats={feed.stats} />
          </FeedSectionCard>

          {feed.recentFollowingReview && (
            <FeedSectionCard>
              <RecentFollowingReview review={feed.recentFollowingReview} />
            </FeedSectionCard>
          )}

          <FeedSectionCard>
            {feed.activeRoom ? (
              <ActiveRoomSection room={feed.activeRoom} />
            ) : (
              <SuggestedRoomsSection rooms={feed.suggestedRooms} />
            )}
          </FeedSectionCard>

          <FeedSectionCard>
            <TrendingSection albums={feed.trendingAlbums} />
          </FeedSectionCard>

          <FeedSectionCard>
            <GenrePickSection pick={feed.genrePick} />
          </FeedSectionCard>
        </VStack>
      )}
    </PageContainer>
  );
}

export default HomeFeed;
