import { useState } from "react";
import type { SubmitEvent } from "react";
import { Field, Heading, Input, Text } from "@chakra-ui/react";
import { ApiError } from "../../../lib/api-error";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import FormSuccessBanner from "../../../components/FormErrorBanner/FormSuccessBanner";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import { forgotPassword } from "../api/authApi";
import AuthFormShell from "./AuthFormShell";
import AuthSwitchLink from "./AuthSwitchLink";

const SUCCESS_MESSAGE =
  "If an account exists for that email, we've sent a link to reset your password. It expires in 30 minutes.";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setEmailError("Email cannot be blank");
      return;
    }

    setEmailError(null);
    setFormError(null);
    setSubmitting(true);

    try {
      await forgotPassword({ email: email.trim() });
      setSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors?.email) {
        setEmailError(error.fieldErrors.email);
      } else if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormShell onSubmit={handleSubmit}>
      <Heading as="h1" fontSize="28px" mb="4px">
        Forgot your password?
      </Heading>
      <Text fontSize="14px" color="text" m="0">
        Enter the email on your account and we&rsquo;ll send you a link to reset
        it.
      </Text>

      {submitted && <FormSuccessBanner>{SUCCESS_MESSAGE}</FormSuccessBanner>}
      {formError && <FormErrorBanner>{formError}</FormErrorBanner>}

      <Field.Root invalid={!!emailError}>
        <Field.Label fontSize="15px" color="ink">
          Email
        </Field.Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          borderColor="border"
          _focus={{ outline: "none", borderColor: "accent" }}
        />
        {emailError && (
          <Field.ErrorText fontSize="13px" color="danger">
            {emailError}
          </Field.ErrorText>
        )}
      </Field.Root>

      <PrimaryButton
        type="submit"
        disabled={submitting}
        fontSize="15px"
        p="14px"
        h="auto"
        mt="8px"
      >
        {submitting ? "Sending…" : "Send reset link"}
      </PrimaryButton>

      <AuthSwitchLink
        prompt="Remember your password?"
        linkText="Log in"
        to="/login"
      />
    </AuthFormShell>
  );
}

export default ForgotPasswordForm;
