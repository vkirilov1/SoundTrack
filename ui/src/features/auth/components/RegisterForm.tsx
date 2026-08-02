import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../../lib/api-error";
import PasswordInput from "../../../components/PasswordInput/PasswordInput";
import { useAuth } from "../stores/useAuth";
import styles from "./RegisterForm.module.css";

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
    <section className={styles.wrap}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.heading}>Create your account</h1>

        {formError && <p className={styles.formError}>{formError}</p>}

        <label className={styles.field}>
          <span className={styles.label}>Username</span>
          <input
            type="text"
            value={form.username}
            maxLength={20}
            onChange={(e) => updateField("username", e.target.value)}
            placeholder=""
            className={styles.input}
          />
          {fieldErrors.username && (
            <span className={styles.error}>{fieldErrors.username}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder=""
            className={styles.input}
          />
          {fieldErrors.email && (
            <span className={styles.error}>{fieldErrors.email}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <PasswordInput
            value={form.password}
            onChange={(value) => updateField("password", value)}
            className={styles.input}
          />
          {fieldErrors.password && (
            <span className={styles.error}>{fieldErrors.password}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Confirm Password</span>
          <PasswordInput
            value={form.confirmPassword}
            onChange={(value) => updateField("confirmPassword", value)}
            className={styles.input}
          />
          {fieldErrors.confirmPassword && (
            <span className={styles.error}>{fieldErrors.confirmPassword}</span>
          )}
        </label>

        <label className={styles.terms}>
          <input
            type="checkbox"
            checked={form.agreeToTerms}
            onChange={(e) => updateField("agreeToTerms", e.target.checked)}
            className={styles.checkbox}
          />
          <span>
            I agree to the <a href="/terms">Terms Of Use</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </span>
        </label>
        {fieldErrors.terms && (
          <span className={styles.error}>{fieldErrors.terms}</span>
        )}

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? "Signing Up…" : "Sign Up"}
        </button>

        <p className={styles.switch}>
          Have an account? <Link to="/login">Log in</Link>.
        </p>
      </form>
    </section>
  );
}

export default RegisterForm;
