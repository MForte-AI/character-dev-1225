import { ReactNode } from "react"

interface LocaleLayoutProps {
  children: ReactNode
}

export default function LocaleLayout({ children }: LocaleLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>SourceField Chat</title>
      </head>
      <body>
        <div className="flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  )
}
