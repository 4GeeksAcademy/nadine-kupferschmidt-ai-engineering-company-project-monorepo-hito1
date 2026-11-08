import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "Brasaland Backoffice",
  description: "Análisis interno de incidencias operativas de Brasaland.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${poppins.variable} scheme-light`}>
      <body className="min-h-screen bg-bo-page font-sans text-bo-text antialiased selection:bg-bo-logo/30">
        {children}
      </body>
    </html>
  );
}
