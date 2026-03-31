import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import NextAuthSessionProvider from "./provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./_components/ThemeProvider"; // Ensure you create this file next

const inter = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "ServiceHub",
  description: "ServiceHub is a platform that connects customers with local service providers, making it easy to find and book services in your area.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="mx-6 md:mx-16">
              <Header />
              <Toaster />
              {children}
            </div>
          </ThemeProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}