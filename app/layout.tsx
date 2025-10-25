import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { ConditionalNavbar } from "@/components/conditional-navbar"
import { AuthProvider } from "@/contexts/AuthContext"
import { LocaleProvider } from "@/contexts/LocaleContext"
import { RouteGuard } from "@/components/route-guard"
import "./globals.css"

export const metadata: Metadata = {
  title: "Tara - AI Learning Assistant",
  description: "Your AI-powered learning companion",
  icons: {
    icon: [
      { url: "/tara-logo.png" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/tara-logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
        <style>{`
          html {
            font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          }
        `}</style>
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LocaleProvider>
            <AuthProvider>
              <RouteGuard>
                <div className="min-h-screen flex flex-col">
                  <ConditionalNavbar />
                  <main className="flex-1">{children}</main>
                </div>
              </RouteGuard>
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
