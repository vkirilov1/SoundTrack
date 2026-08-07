import { useCallback, useState } from "react";
import { Box, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "../api/followApi";
import Pagination from "../../../components/Pagination/Pagination";
import PagedSection from "../../../components/PagedSection/PagedSection";
import Avatar from "../../../components/Avatar/Avatar";
import FollowButton from "../../../components/FollowButton/FollowButton";
import { useAuth } from "../../auth/stores/useAuth";
import { usePagedList } from "../../../hooks/usePagedList";
import { userPhotoUrl } from "../../../utils/images";
import { ApiError } from "../../../lib/api-error";
import type { UserProfile } from "../../../types/auth";

interface FollowListCardProps {
  userId: number;
  mode: "followers" | "following";
}

function FollowListCard({ userId, mode }: FollowListCardProps) {
  const { user: currentUser } = useAuth();
  const invalidId = !Number.isFinite(userId);
  const isAdmin = currentUser?.role === "ADMIN";
  const hideFollowsYouBadge =
    mode === "followers" && currentUser?.id === userId;

  const fetchPage = useCallback(
    (page: number) =>
      mode === "followers"
        ? getFollowers(userId, page)
        : getFollowing(userId, page),
    [userId, mode],
  );
  const {
    items: users,
    setItems: setUsers,
    page,
    totalPages,
    loading,
    listLoading,
    goToPage,
  } = usePagedList(fetchPage, { enabled: !invalidId });

  const [pending, setPending] = useState<Record<number, boolean>>({});

  function handleToggleFollow(targetId: number, followed: boolean) {
    if (pending[targetId]) return;

    const next = !followed;
    setPending((prev) => ({ ...prev, [targetId]: true }));
    setUsers((prev) =>
      prev.map((u) => (u.id === targetId ? { ...u, followed: next } : u)),
    );

    const request = next ? followUser(targetId) : unfollowUser(targetId);

    request
      .catch((error: unknown) => {
        const alreadyInTargetState =
          error instanceof ApiError &&
          ((next && error.status === 409) || (!next && error.status === 404));
        if (alreadyInTargetState) return;

        setUsers((prev) =>
          prev.map((u) => (u.id === targetId ? { ...u, followed } : u)),
        );
      })
      .finally(() => setPending((prev) => ({ ...prev, [targetId]: false })));
  }

  return (
    <>
      <PagedSection
        loading={loading}
        listLoading={listLoading}
        isEmpty={users.length === 0}
        emptyMessage={
          mode === "followers"
            ? "No followers yet."
            : "Not following anyone yet."
        }
        spinnerLabel={`Loading ${mode}`}
      >
        <Box
          as="ul"
          listStyle="none"
          m="0"
          mt="16px"
          p="0"
          display="grid"
          gridTemplateColumns="repeat(2, 1fr)"
          columnGap="24px"
          rowGap="24px"
        >
          {users.map((rowUser: UserProfile) => (
            <HStack
              as="li"
              key={rowUser.id}
              gap="12px"
              align="flex-start"
              minW="0"
            >
              <Link asChild flexShrink="0">
                <RouterLink to={`/profile/${rowUser.id}`}>
                  <Avatar
                    src={userPhotoUrl(
                      rowUser.profilePictureUrl ?? "userDefault.png",
                    )}
                    alt={rowUser.username}
                    size="48px"
                  />
                </RouterLink>
              </Link>

              <VStack flex="1" minW="0" gap="2px" align="stretch">
                <HStack gap="8px" align="center">
                  <Link
                    asChild
                    minW="0"
                    fontSize="15px"
                    fontWeight="600"
                    color="ink"
                    textDecoration="none"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    _hover={{ color: "accent" }}
                  >
                    <RouterLink to={`/profile/${rowUser.id}`}>
                      {rowUser.username}
                    </RouterLink>
                  </Link>
                  {!isAdmin && currentUser && currentUser.id !== rowUser.id && (
                    <FollowButton
                      followed={rowUser.followed}
                      disabled={pending[rowUser.id]}
                      onClick={() =>
                        handleToggleFollow(rowUser.id, rowUser.followed)
                      }
                      size={24}
                    />
                  )}
                </HStack>
                {rowUser.followsYou && !hideFollowsYouBadge && (
                  <Box
                    as="span"
                    display="inline-block"
                    w="fit-content"
                    bg="border"
                    color="text"
                    fontSize="10px"
                    fontWeight="700"
                    letterSpacing="0.03em"
                    px="6px"
                    py="2px"
                    borderRadius="4px"
                  >
                    FOLLOWS YOU
                  </Box>
                )}
                {rowUser.bio && (
                  <Text
                    as="span"
                    fontSize="13px"
                    color="text"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {rowUser.bio}
                  </Text>
                )}
              </VStack>
            </HStack>
          ))}
        </Box>
      </PagedSection>
      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
    </>
  );
}

export default FollowListCard;
