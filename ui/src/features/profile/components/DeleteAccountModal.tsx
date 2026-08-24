import { useState } from "react";
import type { SubmitEvent } from "react";
import { Field, HStack, Text, chakra } from "@chakra-ui/react";
import Modal from "../../../components/Modal/Modal";
import ModalHeader from "../../../components/Modal/ModalHeader";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import PasswordInput from "../../../components/PasswordInput/PasswordInput";
import SecondaryButton from "../../../components/buttons/SecondaryButton";
import { ApiError } from "../../../lib/api-error";
import { deleteAccount } from "../api/profileApi";

interface DeleteAccountModalProps {
  onClose: () => void;
}

function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      await deleteAccount(password);
      window.location.href = "/?accountDeleted=1";
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} maxW="440px">
      <chakra.form onSubmit={handleSubmit} noValidate>
        <ModalHeader title="Delete Account" onClose={onClose} />

        <chakra.div p="24px" display="flex" flexDirection="column" gap="16px">
          <Text m="0" fontSize="14px" color="ink" lineHeight="1.6">
            Your account will be deactivated immediately and you&rsquo;ll be
            logged out everywhere. We&rsquo;ll email you a link to restore it -
            after 30 days with no restore, it&rsquo;s permanently erased.
          </Text>

          {error && <FormErrorBanner>{error}</FormErrorBanner>}

          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Confirm your password
            </Field.Label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              borderColor="border"
              _focus={{ outline: "none", borderColor: "accent" }}
            />
          </Field.Root>
        </chakra.div>

        <HStack
          justify="flex-end"
          gap="10px"
          p="16px 24px"
          borderTop="1px solid"
          borderColor="border"
        >
          <SecondaryButton
            onClick={onClose}
            disabled={submitting}
            fontSize="13px"
            px="16px"
            py="8px"
          >
            Cancel
          </SecondaryButton>
          <chakra.button
            type="submit"
            disabled={!password || submitting}
            bg="danger"
            color="white"
            fontSize="13px"
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing="0.4px"
            border="none"
            borderRadius="md"
            px="16px"
            py="8px"
            cursor="pointer"
            _hover={{ bg: "dangerHover" }}
            _disabled={{ opacity: 0.7, cursor: "default" }}
          >
            {submitting ? "Deleting…" : "Delete Account"}
          </chakra.button>
        </HStack>
      </chakra.form>
    </Modal>
  );
}

export default DeleteAccountModal;
