import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { chakra, Field, Heading, Input, Link } from "@chakra-ui/react";
import { ApiError } from "../../../lib/api-error";
import FormErrorBanner from "../../../components/FormErrorBanner/FormErrorBanner";
import PasswordInput from "../../../components/PasswordInput/PasswordInput";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import { useAuth } from "../stores/useAuth";
import AuthFormShell from "./AuthFormShell";
import AuthSwitchLink from "./AuthSwitchLink";

interface FormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const INITIAL_FORM: FormState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

type FieldName =
  "username" | "email" | "password" | "confirmPassword" | "terms";
type FieldErrorState = Partial<Record<FieldName, string>>;

const fieldStyle = {
  borderColor: "border",
  _focus: { outline: "none", borderColor: "accent" },
} as const;

function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorState>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): FieldErrorState {
    const errors: FieldErrorState = {};

    const emailToValidate: string = form.email.trim();
    const passwordToValidate: string = form.password.trim();

    if (!form.username.trim()) errors.username = "Username cannot be blank";
    if (!emailToValidate) errors.email = "Email cannot be blank";
    if (!passwordToValidate) errors.password = "Password cannot be blank";

    if (!form.agreeToTerms) {
      errors.terms = "You must agree to the Terms Of Use and Privacy Policy";
    }

    const validEmailRegEx = new RegExp("^[^@\\s]+@[^@\\s.]+\\.[^@\\s]+$");

    if (emailToValidate && !validEmailRegEx.test(form.email.trim())) {
      errors.email = 'Email must follow the format "example@example.com"';
    }

    if (passwordToValidate) {
      if (passwordToValidate.length < 8) {
        errors.password = "Password must be at least 8 characters long";
      } else if (!/[0-9]/.test(passwordToValidate)) {
        errors.password = "Password must contain at least one digit";
      } else if (!/[a-z]/.test(passwordToValidate)) {
        errors.password = "Password must contain at least one lowercase letter";
      } else if (!/[A-Z]/.test(passwordToValidate)) {
        errors.password = "Password must contain at least one uppercase letter";
      } else if (!/[@#$%^&+=]/.test(passwordToValidate)) {
        errors.password =
          "Password must contain at least one special character (@#$%^&+=)";
      } else if (/\s/.test(passwordToValidate)) {
        errors.password = "Password must not contain whitespace";
      }
    }

    if (form.confirmPassword.trim() !== passwordToValidate) {
      errors.confirmPassword = "Passwords do not match";
    }

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
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/");
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setFieldErrors(error.fieldErrors as FieldErrorState);
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
        Create your account
      </Heading>

      {formError && <FormErrorBanner>{formError}</FormErrorBanner>}

      <Field.Root invalid={!!fieldErrors.username}>
        <Field.Label fontSize="15px" color="ink">
          Username
        </Field.Label>
        <Input
          type="text"
          value={form.username}
          maxLength={20}
          onChange={(e) => updateField("username", e.target.value)}
          {...fieldStyle}
        />
        {fieldErrors.username && (
          <Field.ErrorText fontSize="13px" color="danger">
            {fieldErrors.username}
          </Field.ErrorText>
        )}
      </Field.Root>

      <Field.Root invalid={!!fieldErrors.email}>
        <Field.Label fontSize="15px" color="ink">
          Email
        </Field.Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          {...fieldStyle}
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
          {...fieldStyle}
        />
        {fieldErrors.password && (
          <Field.ErrorText fontSize="13px" color="danger">
            {fieldErrors.password}
          </Field.ErrorText>
        )}
      </Field.Root>

      <Field.Root invalid={!!fieldErrors.confirmPassword}>
        <Field.Label fontSize="15px" color="ink">
          Confirm Password
        </Field.Label>
        <PasswordInput
          value={form.confirmPassword}
          onChange={(value) => updateField("confirmPassword", value)}
          {...fieldStyle}
        />
        {fieldErrors.confirmPassword && (
          <Field.ErrorText fontSize="13px" color="danger">
            {fieldErrors.confirmPassword}
          </Field.ErrorText>
        )}
      </Field.Root>

      <chakra.label
        display="flex"
        alignItems="flex-start"
        gap="10px"
        fontSize="14px"
        color="ink"
      >
        <chakra.input
          type="checkbox"
          checked={form.agreeToTerms}
          onChange={(e) => updateField("agreeToTerms", e.target.checked)}
          boxSize="16px"
          mt="3px"
          css={{ accentColor: "var(--chakra-colors-checkbox)" }}
        />
        <chakra.span>
          I agree to the{" "}
          <Link asChild textDecoration="underline">
            <RouterLink to="/terms">Terms Of Use</RouterLink>
          </Link>{" "}
          and{" "}
          <Link asChild textDecoration="underline">
            <RouterLink to="/privacy">Privacy Policy</RouterLink>
          </Link>
          .
        </chakra.span>
      </chakra.label>
      {fieldErrors.terms && (
        <chakra.span fontSize="13px" color="danger">
          {fieldErrors.terms}
        </chakra.span>
      )}

      <PrimaryButton
        type="submit"
        disabled={submitting}
        fontSize="15px"
        p="14px"
        h="auto"
        mt="8px"
      >
        {submitting ? "Signing Up…" : "Sign Up"}
      </PrimaryButton>

      <AuthSwitchLink prompt="Have an account?" linkText="Log in" to="/login" />
    </AuthFormShell>
  );
}

export default RegisterForm;
