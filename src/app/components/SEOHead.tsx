import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
}

const SITE_NAME = "The Girardi Oil | 1000 Horia";
const DEFAULT_DESCRIPTION =
  "Griechisches Olivenöl der feinen Art – BIO Extra Nativ, kalt gepresst, direkt vom Familienbetrieb Girardi aus Tirol. Jetzt online bestellen!";
const DEFAULT_IMAGE =
  "https://ik.imagekit.io/iu69j6qea/the-girardi-oil-kaltegpresstes-extra-natives-biologisches-oliven%C3%B6l.jpg";
const BASE_URL = "https://1000horia.at";

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  type = "website",
  image = DEFAULT_IMAGE,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="de_AT" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data - LocalBusiness */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "1000 Horia – The Girardi Oil",
          description: DEFAULT_DESCRIPTION,
          url: BASE_URL,
          image: DEFAULT_IMAGE,
          telephone: "+4366455555577",
          email: "info@1000horia.at",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Innsbruck",
            addressRegion: "Tirol",
            addressCountry: "AT",
          },
          priceRange: "€€",
          sameAs: [],
        })}
      </script>
    </Helmet>
  );
}
