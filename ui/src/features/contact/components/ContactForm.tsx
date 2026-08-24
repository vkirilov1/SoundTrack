import { useState } from "react";
import type { SubmitEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Field,
  Heading,
  Input,
  Text,
  Textarea,
  chakra,
} from "@chakra-ui/react";
import { ApiError } from "../../../lib/api-error";
import { useAuth } from "../../auth/stores/useAuth";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import FormSuccessBanner from "../../../components/FormErrorBanner/FormSuccessBanner";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import SelectImageButton from "../../edit-requests/components/SelectImageButton";
import PageContainer from "../../../components/PageContainer/PageContainer";
import { submitContactRequest } from "../api/contactApi";
import { CONTACT_REQUEST_TYPES } from "../types";
import type { ContactRequestType } from "../types";

const MAX_MESSAGE_LENGTH = 3000;

function isContactRequestType(
  value: string | null,
): value is ContactRequestType {
  return CONTACT_REQUEST_TYPES.some((t) => t.value === value);
}

function ContactForm() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const presetType = searchParams.get("type");

  const [type, setType] = useState<ContactRequestType>(
    isContactRequestType(presetType) ? presetType : "OTHER",
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    message.trim().length > 0 &&
    (!!user || email.trim().length > 0) &&
    !submitting;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setSubmitting(true);

    try {
      await submitContactRequest({
        type,
        message: message.trim(),
        email: user ? undefined : email.trim(),
        attachment,
      });
      setSubmitted(true);
      setMessage("");
      setAttachment(null);
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
    <PageContainer maxW="640px">
      <Heading as="h1" fontSize="30px" m="0">
        Contact Us
      </Heading>
      <Text mt="10px" fontSize="14px" color="text" lineHeight="1.6">
        Found a bug, have a question, or need to report something? Send it our
        way.
      </Text>

      {submitted && (
        <Box mt="20px">
          <FormSuccessBanner>
            Thanks - your message is on its way. We'll get back to you at the
            email you provided.
          </FormSuccessBanner>
        </Box>
      )}

      <chakra.form
        onSubmit={handleSubmit}
        noValidate
        display="flex"
        flexDirection="column"
        gap="20px"
        mt="28px"
      >
        {error && <FormErrorBanner>{error}</FormErrorBanner>}

        <Box>
          <Text m="0 0 10px" fontSize="14px" fontWeight="500" color="ink">
            What's this about?
          </Text>
          <Box display="flex" flexWrap="wrap" gap="8px">
            {CONTACT_REQUEST_TYPES.map((option) => {
              const selected = option.value === type;
              return (
                <chakra.button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  px="14px"
                  py="7px"
                  fontSize="13px"
                  fontWeight="600"
                  borderRadius="full"
                  border="none"
                  bg={selected ? "accent" : "accentBg"}
                  color={selected ? "white" : "ink"}
                  cursor="pointer"
                  transition="background-color 0.15s ease, color 0.15s ease"
                  _hover={
                    selected ? undefined : { bg: "accent", color: "white" }
                  }
                >
                  {option.label}
                </chakra.button>
              );
            })}
          </Box>
        </Box>

        {!user && (
          <Field.Root>
            <Field.Label fontSize="14px" color="ink">
              Your email
            </Field.Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="So we can reply to you"
              borderColor="border"
              _focus={{ outline: "none", borderColor: "accent" }}
            />
          </Field.Root>
        )}

        <Field.Root>
          <Field.Label fontSize="14px" color="ink">
            Message
          </Field.Label>
          <Textarea
            value={message}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            minH="140px"
            maxH="380px"
            resize="vertical"
            borderColor="border"
            _focus={{ outline: "none", borderColor: "accent" }}
          />
          <Text m="4px 0 0" fontSize="12px" color="text" textAlign="right">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </Text>
        </Field.Root>

        <Box>
          <Text m="0 0 10px" fontSize="14px" fontWeight="500" color="ink">
            Attach a screenshot (optional)
          </Text>
          <Box display="flex" alignItems="center" gap="12px">
            <SelectImageButton
              handleFileChange={(e) =>
                setAttachment(e.target.files?.[0] ?? null)
              }
            />
            {attachment && (
              <Text m="0" fontSize="13px" color="text">
                {attachment.name}
              </Text>
            )}
          </Box>
        </Box>

        <PrimaryButton
          type="submit"
          disabled={!canSubmit}
          fontSize="15px"
          p="14px"
          h="auto"
          mt="8px"
        >
          {submitting ? "Sending…" : "Send message"}
        </PrimaryButton>
      </chakra.form>
    </PageContainer>
  );
}

export default ContactForm;
