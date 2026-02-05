import type { Metadata } from "next";
import NavBar from "./components/NavBar";

export const metadata: Metadata = {
  title: "Hello World",
  description: "Hello World + Captions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          paddingTop: 90, 
          color: "white",
          minHeight: "100vh",
          background:
            "radial-gradient(1200px 600px at 20% 10%, rgba(255,255,255,0.10), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(255,255,255,0.08), transparent 60%), #000",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <NavBar />
        {children}
      </body>
    </html>
  );
}

