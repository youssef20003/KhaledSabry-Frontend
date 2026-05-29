import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "MAK-Z Clothing",
  description: "MAK-Z clothing storefront",
  icons: {
    icon: "/Logo.png",
    apple: "/Logo.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
