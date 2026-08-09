import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Box, Heading, HStack, Link, Tabs, Text } from "@chakra-ui/react";
import { getUserProfile } from "../api/profileApi";
import { followUser, unfollowUser } from "../api/followApi";
import { ApiError } from "../../../lib/api-error";
import EditIcon from "../../../components/icons/EditIcon";
import PageStatus from "../../../components/PageStatus/PageStatus";
import FollowButton from "../../../components/FollowButton/FollowButton";
import { useAuth } from "../../../features/auth/stores/useAuth";
import { MONTH_YEAR_FORMAT } from "../../../utils/date";
import { userPhotoUrl } from "../../../utils/images";
import type { UserProfile } from "../../../types/auth";
import Avatar from "../../../components/Avatar/Avatar";
import ListsCard from "./ListsCard";
import ReviewsCard from "./ReviewsCard";
import FollowListCard from "./FollowListCard";
import AddAlbumButton from "./admin/AddAlbumButton";
import AddArtistButton from "./admin/AddArtistButton";
import RequestsCard from "../../edit-requests/components/RequestsCard";
import AdminResetPhotoButton from "../../edit-requests/components/AdminResetPhotoButton";
import { resetUserPhotoAsAdmin } from "../../edit-requests/api/adminContentApi";

type ProfileTab = "lists" | "reviews" | "followers" | "following";

function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const id = Number(userId);
  const invalidId = !Number.isFinite(id);
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<ProfileTab>("lists");
  const [loading, setLoading] = useState(() => !invalidId);
  const [notFound, setNotFound] = useState(() => invalidId);

  const isOwnAdminProfile =
    currentUser?.id === id && currentUser?.role === "ADMIN";
  const canModeratePhoto = isAdmin && currentUser?.id !== id;

  const [followPending, setFollowPending] = useState(false);

  function handleToggleFollow() {
    if (!profile || followPending) return;

    const next = !profile.followed;
    setFollowPending(true);
    setProfile((prev) => (prev ? { ...prev, followed: next } : prev));

    const request = next ? followUser(profile.id) : unfollowUser(profile.id);

    request
      .catch((error: unknown) => {
        const alreadyInTargetState =
          error instanceof ApiError &&
          ((next && error.status === 409) || (!next && error.status === 404));
        if (alreadyInTargetState) return;

        setProfile((prev) => (prev ? { ...prev, followed: !next } : prev));
      })
      .finally(() => setFollowPending(false));
  }

  function handleResetPhoto() {
    return resetUserPhotoAsAdmin(id).then((updated) => {
      setProfile((prev) =>
        prev ? { ...prev, profilePictureUrl: updated.profilePictureUrl } : prev,
      );
    });
  }

  useEffect(() => {
    if (invalidId) return;

    let cancelled = false;

    getUserProfile(id)
      .then((profileRes) => {
        if (cancelled) return;
        setProfile(profileRes);
        setNotFound(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, invalidId]);

  if (loading) {
    return (
      <Box
        as="section"
        position="relative"
        w="100%"
        maxW="contentWidth"
        mx="auto"
        px="24px"
        pt="56px"
        pb="80px"
      >
        <PageStatus variant="loading" />
      </Box>
    );
  }

  if (notFound || !profile) {
    return (
      <Box
        as="section"
        position="relative"
        w="100%"
        maxW="contentWidth"
        mx="auto"
        px="24px"
        pt="56px"
        pb="80px"
      >
        <PageStatus variant="not-found" message="This user doesn't exist." />
      </Box>
    );
  }

  return (
    <Box
      as="section"
      position="relative"
      w="100%"
      maxW="contentWidth"
      mx="auto"
      px="24px"
      pt="56px"
      pb="80px"
    >
      {currentUser?.id === profile.id && (
        <Link
          asChild
          position="absolute"
          top="24px"
          right="24px"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          boxSize="36px"
          borderRadius="full"
          color="text"
          transition="color 0.15s ease, background-color 0.15s ease"
          _hover={{ color: "ink", bg: "border" }}
        >
          <RouterLink to="/profile/edit" aria-label="Edit profile">
            <EditIcon />
          </RouterLink>
        </Link>
      )}

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
      >
        <Avatar
          src={userPhotoUrl(profile.profilePictureUrl ?? "userDefault.png")}
          alt={profile.username}
          size="140px"
        />
        {canModeratePhoto && (
          <AdminResetPhotoButton onReset={handleResetPhoto} />
        )}
        <Box display="flex" alignItems="center" gap="10px" mt="20px">
          <Heading as="h1" fontSize="22px" m="0">
            {profile.username}
          </Heading>
          {!isAdmin && currentUser && currentUser.id !== profile.id && (
            <FollowButton
              followed={profile.followed}
              disabled={followPending}
              onClick={handleToggleFollow}
              size={28}
            />
          )}
        </Box>
        {profile.followsYou && (
          <Box
            as="span"
            display="inline-block"
            w="fit-content"
            mt="8px"
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
        {profile.bio && (
          <Text mt="8px" color="text" maxW="480px">
            {profile.bio}
          </Text>
        )}
        <Text mt="8px" fontSize="13px" color="text" opacity="0.7">
          Joined {MONTH_YEAR_FORMAT.format(new Date(profile.joinDate))}
        </Text>
        {isOwnAdminProfile && (
          <HStack gap="10px">
            <AddAlbumButton />
            <AddArtistButton />
          </HStack>
        )}
      </Box>

      {isOwnAdminProfile ? (
        <Box mt="32px" display="flex" justifyContent="center">
          <Box w="100%" maxW="600px" minW="0">
            <RequestsCard />
          </Box>
        </Box>
      ) : (
        <Tabs.Root
          value={currentTab}
          onValueChange={(details) =>
            setCurrentTab(details.value as ProfileTab)
          }
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
              Lists
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
              Reviews
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
                <ListsCard userId={id} />
              </Tabs.Content>
              <Tabs.Content value="reviews">
                <ReviewsCard userId={id} />
              </Tabs.Content>
              <Tabs.Content value="followers">
                <FollowListCard userId={id} mode="followers" />
              </Tabs.Content>
              <Tabs.Content value="following">
                <FollowListCard userId={id} mode="following" />
              </Tabs.Content>
            </Box>
          </Box>
        </Tabs.Root>
      )}
    </Box>
  );
}

export default ProfilePage;
