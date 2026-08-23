import { Box, Heading, chakra } from "@chakra-ui/react";
import AlbumGrid from "../../charts/components/AlbumGrid";
import type { AlbumSummary } from "../../../types/album";
import HomeEmptyState from "./HomeEmptyState";

interface TrendingSectionProps {
  albums: AlbumSummary[];
}

function TrendingSection({ albums }: TrendingSectionProps) {
  return (
    <Box as="section">
      <Heading as="h2" fontSize="18px" fontWeight="700" color="ink" m="0">
        Trending <chakra.span color="accent">this week</chakra.span>
      </Heading>

      {albums.length === 0 ? (
        <HomeEmptyState message="Nothing's been reviewed this week yet - check back soon." />
      ) : (
        <AlbumGrid albums={albums} rankOffset={0} displayRank />
      )}
    </Box>
  );
}

export default TrendingSection;
