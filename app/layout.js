import ClientProviders from "../components/ClientProviders";
import Layout from "../components/layout/Layout";
import "../styles/main.css";


export const metadata = {
  title: "Efie Plans - Architectural Design & Construction",
  description: "Efie Plans provides professional architectural designs, building, and construction services.",
  icons: {
    icon: "/icon.avif",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <Layout>{children}</Layout>
        </ClientProviders>
      </body>
    </html>
  );
}
