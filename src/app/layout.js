import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/context/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chatbot Maker",
  description: "Create your own chatbot in minutes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {
                console.error('Error setting initial theme:', e);
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
