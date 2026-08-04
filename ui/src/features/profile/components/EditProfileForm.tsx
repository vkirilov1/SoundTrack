import { useState } from "react";
import type { SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Box, chakra, Field, Heading, Input, Textarea } from "@chakra-ui/react";
import {
  resetProfilePhoto,
  updateProfile,
  uploadProfilePhoto,
} from "../api/profileApi";
import { ApiError } from "../../../lib/api-error";
import { useAuth } from "../../../features/auth/stores/useAuth";
import { userPhotoUrl } from "../../../utils/images";
import type { FieldErrors } from "../../../types/auth";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import AvatarUploadCard from "./AvatarUploadCard";

function EditProfileForm() {
  const navigate = useNavigate();
  const { user, isLoading, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return null;
  }

  async function handleSaveProfile(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: FieldErrors = {};
    if (!username.trim()) errors.username = "Username cannot be blank";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSaving(true);

    try {
      const updated = await updateProfile({
        username: username.trim(),
        bio: bio.trim(),
      });
      updateUser(updated);
      navigate(`/profile/${updated.id}`);
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
      } else if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box
      as="section"
      w="100%"
      maxW="contentWidth"
      mx="auto"
      px="24px"
      pt="56px"
      pb="80px"
    >
      <Heading as="h1" fontSize="32px" mb="32px">
        It's You!
      </Heading>

      <AvatarUploadCard
        avatarSrc={userPhotoUrl(user.profilePictureUrl ?? "userDefault.png")}
        username={user.username}
        onUpload={(file) => uploadProfilePhoto(file).then(updateUser)}
        onReset={() => resetProfilePhoto().then(updateUser)}
      />

      <chakra.form
        onSubmit={handleSaveProfile}
        noValidate
        display="flex"
        flexDirection="column"
        maxW="480px"
        gap="20px"
      >
        <Heading as="h2" fontSize="22px" mb="4px">
          Profile Data
        </Heading>

        {formError && <FormErrorBanner>{formError}</FormErrorBanner>}

        <Field.Root invalid={!!fieldErrors.username}>
          <Field.Label fontSize="15px" color="ink">
            Display Name
          </Field.Label>
          <Input
            value={username}
            maxLength={20}
            onChange={(e) => setUsername(e.target.value)}
            borderColor="border"
            _focus={{ borderColor: "accent" }}
          />
          {fieldErrors.username && (
            <Field.ErrorText fontSize="13px" color="danger">
              {fieldErrors.username}
            </Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!fieldErrors.bio}>
          <Field.Label fontSize="15px" color="ink">
            About you
          </Field.Label>
          <Textarea
            value={bio}
            maxLength={1024}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            minH="90px"
            maxH="240px"
            resize="vertical"
            borderColor="border"
            _focus={{ borderColor: "accent" }}
          />
          {fieldErrors.bio && (
            <Field.ErrorText fontSize="13px" color="danger">
              {fieldErrors.bio}
            </Field.ErrorText>
          )}
        </Field.Root>

        <PrimaryButton
          type="submit"
          disabled={saving}
          fontSize="15px"
          p="14px"
          h="auto"
          mt="8px"
        >
          {saving ? "Saving…" : "Save Changes"}
        </PrimaryButton>
      </chakra.form>
    </Box>
  );
}

export default EditProfileForm;
