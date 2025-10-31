import "./globals.css";
import ClientAppWrapper from "./components/Layout/ClientAppWrapper";

export const metadata = {
  title: "Yuukke",
  description:
    "Looking for conscious fashion, eco-friendly home goods, or natural beauty products? Explore our marketplace of women-owned businesses dedicated to positive change. Shop with intention and support a more sustainable future.",
  openGraph: {
    title: "Yuukke",
    description:
      "Looking for conscious fashion, eco-friendly home goods, or natural beauty products? Explore our marketplace of women-owned businesses dedicated to positive change. Shop with intention and support a more sustainable future.",
    url: "https://shop.yuukke.com",
    siteName: "Yuukke",
    images: [
      {
        url: "https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/logo_for_in.jpg",
        alt: "Yuukke Marketplace - Explore Authentic Indian Products",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta
          property="og:image:alt"
          content={metadata.openGraph.images[0].alt}
        />

        {/* ✅ Google site verification */}
        <meta
          name="google-site-verification"
          content="9naGn2ncQ9JE4a4-MMIopkLPdL59RWPoXsO-UBFKZdI"
        />
      </head>

      <body className="antialiased">
        {/* ✅ Client-side hydration for everything interactive */}
        <ClientAppWrapper>{children}</ClientAppWrapper>

        {/* ✅ GTM noscript fallback (for browsers with JS disabled) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TSWV69XP"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
      </body>
    </html>
  );
}
