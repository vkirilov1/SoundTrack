import { useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { Heading, Link, Text, VStack } from "@chakra-ui/react";
import { ApiError } from "../../../lib/api-error";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import FormSuccessBanner from "../../../components/FormErrorBanner/FormSuccessBanner";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import { restoreAccount } from "../api/authApi";
import AuthFormShell from "./AuthFormShell";

function RestoreAccountPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <AuthFormShell onSubmit={(e) => e.preventDefault()}>
        <Heading as="h1" fontSize="28px" mb="4px">
          Invalid restore link
        </Heading>
        <FormErrorBanner>
          This account restore link is missing or malformed.
        </FormErrorBanner>
      </AuthFormShell>
    );
  }

  async function handleRestore() {
    setError(null);
    setSubmitting(true);

    try {
      await restoreAccount(token as string);
      setRestored(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormShell onSubmit={(e) => e.preventDefault()}>
      <Heading as="h1" fontSize="28px" mb="4px">
        Restore your account
      </Heading>

      {restored ? (
        <VStack align="stretch" gap="16px">
          <FormSuccessBanner>
            Your account has been restored. You can log in again.
          </FormSuccessBanner>
          <Link
            asChild
            color="accent"
            fontWeight="700"
            textDecoration="none"
            _hover={{ color: "accentHover" }}
          >
            <RouterLink to="/login">Go to login</RouterLink>
          </Link>
        </VStack>
      ) : (
        <>
          <Text fontSize="14px" color="text" m="0">
            Undo your account deletion and log in again with your existing
            password.
          </Text>

          {error && <FormErrorBanner>{error}</FormErrorBanner>}

          <PrimaryButton
            type="button"
            onClick={handleRestore}
            disabled={submitting}
            fontSize="15px"
            p="14px"
            h="auto"
            mt="8px"
          >
            {submitting ? "Restoring…" : "Restore my account"}
          </PrimaryButton>
        </>
      )}
    </AuthFormShell>
  );
}

export default RestoreAccountPage;
