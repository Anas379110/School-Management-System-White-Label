"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/modules/auth/passwordResetSchema";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
  });

  async function onSubmit(data: RequestPasswordResetInput) {
    setSuccessMessage(null);

    setErrorMessage(null);
    try {
      const response = await fetch("/api/v1/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        setErrorMessage(t("resetRequestUnavailable"));
        return;
      }
      setSuccessMessage(t("resetRequestSuccess"));
    } catch {
      setErrorMessage(t("resetRequestUnavailable"));
    }
  }

  if (successMessage) {
    return <p className="text-sm text-green-700">{successMessage}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Input
        id="email"
        type="email"
        label={t("emailLabel")}
        placeholder={t("emailPlaceholder")}
        error={errors.email?.message}
        {...register("email")}
      />
      {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? t("submitting") : t("resetRequestButton")}
      </Button>
    </form>
  );
        }
