import { Box, Heading, chakra } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import AlbumGrid from "../../charts/components/AlbumGrid";
import type { GenrePick } from "../types";
import HomeEmptyState from "./HomeEmptyState";

interface GenrePickSectionProps {
  pick: GenrePick | null;
}

function GenrePickSection({ pick }: GenrePickSectionProps) {
  return (
    <Box as="section">
      <Heading as="h2" fontSize="18px" fontWeight="700" color="ink" m="0">
        Discover top picks from your{" "}
        {pick ? (
          <RouterLink to={`/genre/${encodeURIComponent(pick.genre)}`}>
            <chakra.span color="accent" _hover={{ color: "accentHover" }}>
              favorite genre
            </chakra.span>
          </RouterLink>
        ) : (
          <chakra.span color="accent">favorite genre</chakra.span>
        )}
      </Heading>

      {pick ? (
        <AlbumGrid albums={pick.albums} rankOffset={0} displayRank={false} />
      ) : (
        <HomeEmptyState message="Favorite a few albums and we'll surface something great from your favorite genre." />
      )}
    </Box>
  );
}

export default GenrePickSection;
