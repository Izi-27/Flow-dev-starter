import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { FlowWalletProvider } from "@/contexts/flow-wallet-context"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "FlowDevKit - Flow Blockchain Developer Toolkit",
  description: "Smart contract templates, CLI tools, and integration guides for Flow blockchain developers",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <FlowWalletProvider>{children}</FlowWalletProvider>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
