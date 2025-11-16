"use client";

import { useState } from "react";
import { Button } from "@vanx/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@vanx/ui/components/field";
import { Input } from "@vanx/ui/components/input";
import { confirmPasswordReset, requestPasswordReset } from "@/lib/api/auth";

interface ResetPasswordFormProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function ResetPasswordForm({
  onClose,
  onSuccess,
}: ResetPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [stage, setStage] = useState<"request" | "confirm">("request");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await requestPasswordReset(email);
      setStage("confirm");
      setInfoMessage("We've sent a reset code to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPasswordValue) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await confirmPasswordReset(email, code, password);
      onSuccess("Password updated. You can now log in.");
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setStage("request");
    setEmail("");
    setCode("");
    setPassword("");
    setConfirmPasswordValue("");
    setInfoMessage("");
    setError("");
    onClose();
  }

  return (
    <form onSubmit={stage === "request" ? handleRequest : handleConfirm}>
      <FieldGroup>
        <FieldDescription className="text-center">
          {stage === "request"
            ? "Enter your email to receive a password reset code."
            : `Enter the code we sent to ${email} and set a new password.`}
        </FieldDescription>

        <Field>
          <FieldLabel htmlFor="resetEmail">Email</FieldLabel>
          <Input
            id="resetEmail"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            disabled={stage === "confirm"}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        {stage === "confirm" && (
          <>
            <Field>
              <FieldLabel htmlFor="resetCode">Reset code</FieldLabel>
              <Input
                id="resetCode"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="123456"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPasswordValue}
                onChange={(e) => setConfirmPasswordValue(e.target.value)}
              />
            </Field>
          </>
        )}

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {infoMessage && (
          <p className="text-sm text-center text-muted-foreground">
            {infoMessage}
          </p>
        )}

        <Field className="flex flex-col gap-3">
          <Button type="submit" disabled={loading}>
            {loading
              ? stage === "request"
                ? "Sending..."
                : "Saving..."
              : stage === "request"
                ? "Send reset code"
                : "Save new password"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={resetForm}
          >
            Back to login
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
