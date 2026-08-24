import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Field,
  Heading,
  Input,
  Link,
  Text,
  chakra,
} from "@chakra-ui/react";
import { ApiError } from "../../../lib/api-error";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import FormSuccessBanner from "../../../components/FormErrorBanner/FormSuccessBanner";
import PasswordInput from "../../../components/PasswordInput/PasswordInput";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import { useAuth } from "../stores/useAuth";
import AuthFormShell from "./AuthFormShell";
import AuthSwitchLink from "./AuthSwitchLink";

interface FormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

const INITIAL_FORM: FormState = {
  email: "",
  password: "",
  rememberMe: true,
};

type FieldName = "email" | "password";
type FieldErrorState = Partial<Record<FieldName, string>>;

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const passwordReset = Boolean(
    (location.state as { passwordReset?: boolean } | null)?.passwordReset,
  );
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorState>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): FieldErrorState {
    const errors: FieldErrorState = {};

    if (!form.email.trim()) errors.email = "Email cannot be blank";
    if (!form.password) errors.password = "Password cannot be blank";

    return errors;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);

    try {
      await login({
        email: form.email.trim(),
        password: form.password,
        rememberMe: form.rememberMe,
      });
      navigate("/");
    } catch (error) {
      if (error instanceof ApiError) {
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
        Log in to your account
      </Heading>

      {passwordReset && (
        <FormSuccessBanner>
          Your password was reset. Log in with your new password.
        </FormSuccessBanner>
      )}
      {formError && <FormErrorBanner>{formError}</FormErrorBanner>}

      <Field.Root invalid={!!fieldErrors.email}>
        <Field.Label fontSize="15px" color="ink">
          Email
        </Field.Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          borderColor="border"
          _focus={{ outline: "none", borderColor: "accent" }}
        />
        {fieldErrors.email && (
          <Field.ErrorText fontSize="13px" color="danger">
            {fieldErrors.email}
          </Field.ErrorText>
        )}
      </Field.Root>

      <Field.Root invalid={!!fieldErrors.password}>
        <Field.Label fontSize="15px" color="ink">
          Password
        </Field.Label>
        <PasswordInput
          value={form.password}
          onChange={(value) => updateField("password", value)}
          borderColor="border"
          _focus={{ outline: "none", borderColor: "accent" }}
        />
        {fieldErrors.password && (
          <Field.ErrorText fontSize="13px" color="danger">
            {fieldErrors.password}
          </Field.ErrorText>
        )}
      </Field.Root>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="12px"
      >
        <chakra.label
          display="flex"
          alignItems="center"
          gap="8px"
          fontSize="14px"
          color="ink"
        >
          <chakra.input
            type="checkbox"
            checked={form.rememberMe}
            onChange={(e) => updateField("rememberMe", e.target.checked)}
            boxSize="16px"
            css={{ accentColor: "var(--chakra-colors-checkbox)" }}
          />
          <Text as="span">Remember Me</Text>
        </chakra.label>

        <Link
          asChild
          fontSize="14px"
          textDecoration="underline"
          color="text"
          whiteSpace="nowrap"
        >
          <RouterLink to="/forgot-password">Forgotten Password?</RouterLink>
        </Link>
      </Box>

      <PrimaryButton
        type="submit"
        disabled={submitting}
        fontSize="15px"
        p="14px"
        h="auto"
        mt="8px"
      >
        {submitting ? "Logging In…" : "Log In"}
      </PrimaryButton>

      <AuthSwitchLink
        prompt="Don't have an account?"
        linkText="Sign up"
        to="/register"
      />
    </AuthFormShell>
  );
}

export default LoginForm;
