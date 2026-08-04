import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Box, Heading, Link, Tabs, Text } from "@chakra-ui/react";
import { getUserProfile } from "../api/profileApi";
import { ApiError } from "../../../lib/api-error";
import EditIcon from "../../../components/icons/EditIcon";
import PageStatus from "../../../components/PageStatus/PageStatus";
import { useAuth } from "../../../features/auth/stores/useAuth";
import { MONTH_YEAR_FORMAT } from "../../../utils/date";
import { userPhotoUrl } from "../../../utils/images";
import type { UserProfile } from "../../../types/auth";
import Avatar from "../../../components/Avatar/Avatar";
import ListsCard from "./ListsCard";
import ReviewsCard from "./ReviewsCard";
import RequestsCard from "../../edit-requests/components/RequestsCard";
import AdminResetPhotoButton from "../../edit-requests/components/AdminResetPhotoButton";
import { resetUserPhotoAsAdmin } from "../../edit-requests/api/adminContentApi";

type ProfileTab = "lists" | "reviews";

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
        <Heading as="h1" fontSize="22px" mt="20px">
          {profile.username}
        </Heading>
        {profile.bio && (
          <Text mt="8px" color="text" maxW="480px">
            {profile.bio}
          </Text>
        )}
        <Text mt="8px" fontSize="13px" color="text" opacity="0.7">
          Joined {MONTH_YEAR_FORMAT.format(new Date(profile.joinDate))}
        </Text>
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
          </Tabs.List>

          <Box mt="32px" display="flex" justifyContent="center">
            <Box w="100%" maxW="600px" minW="0">
              <Tabs.Content value="lists">
                <ListsCard userId={id} />
              </Tabs.Content>
              <Tabs.Content value="reviews">
                <ReviewsCard userId={id} />
              </Tabs.Content>
            </Box>
          </Box>
        </Tabs.Root>
      )}
    </Box>
  );
}

export default ProfilePage;
