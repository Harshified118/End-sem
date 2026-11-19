import type { Metadata } from "next";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";

const jakarta = localFont({
  src: "../../public/fonts/jakarta-variable.woff2",
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = localFont({
  src: "../../public/fonts/jetbrains-variable.woff2",
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DropOrCop | Sneaker resale verdicts",
  description:
    "Predict a sneaker's resale price and get a clear COP or DROP verdict, backed by model evidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`min-h-full antialiased ${jakarta.variable} ${jetbrains.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;try{t=localStorage.getItem("droporcop-theme")}catch(e){}if(t!=="dark"&&t!=="day"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"day"}document.documentElement.dataset.theme=t})()`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col overflow-y-auto bg-canvas text-ink-1"
      >
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
