import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../api/ApiError";
import { useAuth } from "../../context/useAuth";
import styles from "./Login.module.css";

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

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
    <section className={styles.wrap}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.heading}>Log in to your account</h1>

        {formError && <p className={styles.formError}>{formError}</p>}

        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={styles.input}
          />
          {fieldErrors.email && (
            <span className={styles.error}>{fieldErrors.email}</span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            className={styles.input}
          />
          {fieldErrors.password && (
            <span className={styles.error}>{fieldErrors.password}</span>
          )}
        </label>

        <div className={styles.optionsRow}>
          <label className={styles.rememberMe}>
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(e) => updateField("rememberMe", e.target.checked)}
              className={styles.checkbox}
            />
            <span>Remember Me</span>
          </label>

          <Link to="/forgot-password" className={styles.forgotPassword}>
            Forgotten Password?
          </Link>
        </div>

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? "Logging In…" : "Log In"}
        </button>

        <p className={styles.switch}>
          Don't have an account? <Link to="/register">Sign up</Link>.
        </p>
      </form>
    </section>
  );
}

export default Login;
