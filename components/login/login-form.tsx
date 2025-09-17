"use client"

import { Brand } from "@/components/ui/brand"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submit-button"

import { useTranslation } from "react-i18next"

export const LoginForm = ({
  signIn,
  signUp,
  handleResetPassword,
  message
}: {
  signIn: (formData: FormData) => void
  signUp: (formData: FormData) => void
  handleResetPassword: (formData: FormData) => void
  message?: string
}) => {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <form
        className="animate-in text-foreground flex w-full flex-1 flex-col justify-center gap-2"
        action={signIn}
      >
        <Brand />

        <Label className="text-md mt-4" htmlFor="email">
          {t("Email")}
        </Label>
        <Input
          className="mb-3 rounded-md border bg-inherit px-4 py-2"
          name="email"
          placeholder={t("you@example.com")}
          required
        />

        <Label className="text-md" htmlFor="password">
          {t("Password")}
        </Label>
        <Input
          className="mb-6 rounded-md border bg-inherit px-4 py-2"
          type="password"
          name="password"
          placeholder="••••••••"
        />

        <SubmitButton className="mb-2 rounded-md bg-blue-700 px-4 py-2 text-white">
          {t("Login")}
        </SubmitButton>

        <SubmitButton
          formAction={signUp}
          className="border-foreground/20 mb-2 rounded-md border px-4 py-2"
        >
          {t("Sign Up")}
        </SubmitButton>

        <div className="text-muted-foreground mt-1 flex justify-center text-sm">
          <span className="mr-1">{t("Forgot your password?")}</span>
          <button
            formAction={handleResetPassword}
            className="text-primary ml-1 underline hover:opacity-80"
          >
            {t("Reset")}
          </button>
        </div>

        {message && (
          <p className="bg-foreground/10 text-foreground mt-4 p-4 text-center">
            {t(message)}
          </p>
        )}
      </form>
    </div>
  )
}
