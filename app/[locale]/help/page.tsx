import initTranslations from "@/lib/i18n"

export default async function HelpPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const { t } = await initTranslations(locale, ["translation"])

  return (
    <div className="size-screen flex flex-col items-center justify-center">
      <div className="text-4xl">{t("Help under construction.")}</div>
    </div>
  )
}
