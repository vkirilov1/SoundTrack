import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Field, Heading, Text } from "@chakra-ui/react";
import { ApiError } from "../../../lib/api-error";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import PasswordInput from "../../../components/PasswordInput/PasswordInput";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import { resetPassword } from "../api/authApi";
import { validatePassword } from "../utils/validatePassword";
import AuthFormShell from "./AuthFormShell";
import AuthSwitchLink from "./AuthSwitchLink";

type FieldName = "newPassword" | "confirmPassword";
type FieldErrorState = Partial<Record<FieldName, string>>;

function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrorState>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <AuthFormShell onSubmit={(e) => e.preventDefault()}>
        <Heading as="h1" fontSize="28px" mb="4px">
          Invalid reset link
        </Heading>
        <FormErrorBanner>
          This password reset link is missing or malformed. Request a new one
          below.
        </FormErrorBanner>
        <AuthSwitchLink
          prompt="Need a new link?"
          linkText="Forgot password"
          to="/forgot-password"
        />
      </AuthFormShell>
    );
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: FieldErrorState = {};
    const passwordError = validatePassword(newPassword);
    if (passwordError) errors.newPassword = passwordError;
    if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);

    try {
      await resetPassword({ token: token as string, newPassword });
      navigate("/login", { state: { passwordReset: true } });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors?.newPassword) {
        setFieldErrors({ newPassword: error.fieldErrors.newPassword });
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
        Choose a new password
      </Heading>
      <Text fontSize="14px" color="text" m="0">
        This link can only be used once.
      </Text>

      {formError && <FormErrorBanner>{formError}</FormErrorBanner>}

      <Field.Root invalid={!!fieldErrors.newPassword}>
        <Field.Label fontSize="15px" color="ink">
          New Password
        </Field.Label>
        <PasswordInput
          value={newPassword}
          onChange={setNewPassword}
          borderColor="border"
          _focus={{ outline: "none", borderColor: "accent" }}
        />
        {fieldErrors.newPassword && (
          <Field.ErrorText fontSize="13px" color="danger">
            {fieldErrors.newPassword}
          </Field.ErrorText>
        )}
      </Field.Root>

      <Field.Root invalid={!!fieldErrors.confirmPassword}>
        <Field.Label fontSize="15px" color="ink">
          Confirm Password
        </Field.Label>
        <PasswordInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          borderColor="border"
          _focus={{ outline: "none", borderColor: "accent" }}
        />
        {fieldErrors.confirmPassword && (
          <Field.ErrorText fontSize="13px" color="danger">
            {fieldErrors.confirmPassword}
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
        {submitting ? "Saving…" : "Reset password"}
      </PrimaryButton>

      <AuthSwitchLink
        prompt="Remember your password?"
        linkText="Log in"
        to="/login"
      />
    </AuthFormShell>
  );
}

export default ResetPasswordForm;
