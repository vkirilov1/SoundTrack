import { Box, Flex, Text } from "@chakra-ui/react";
import type { HomeStats } from "../types";

interface StatsStripProps {
  stats: HomeStats;
}

interface StatTileProps {
  value: string;
  label: string;
}

function StatTile({ value, label }: StatTileProps) {
  return (
    <Box textAlign="center">
      <Text m="0" fontSize="22px" fontWeight="700" color="ink">
        {value}
      </Text>
      <Text m="0" fontSize="12px" color="text" opacity="0.8">
        {label}
      </Text>
    </Box>
  );
}

function StatsStrip({ stats }: StatsStripProps) {
  return (
    <Flex gap="40px">
      <StatTile value={String(stats.reviewCount)} label="Reviews" />
      <StatTile
        value={stats.reviewCount > 0 ? stats.averageRating.toFixed(1) : "—"}
        label="Avg rating"
      />
      <StatTile value={String(stats.followerCount)} label="Followers" />
    </Flex>
  );
}

export default StatsStrip;
