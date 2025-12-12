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
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.setAttribute('data-theme', 'dark');
              } catch (e) {
                console.error('Error setting theme:', e);
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
