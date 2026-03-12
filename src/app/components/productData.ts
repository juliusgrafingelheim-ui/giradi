export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  size: string;
  category: "bio" | "extra-nativ" | "aroma" | "balsamessig";
  categoryLabel: string;
  image: string;
  badge?: string;
  inStock: boolean;
  details: string[];
}

// Real ImageKit CDN images
const IK = {
  girardiOil: "https://ik.imagekit.io/iu69j6qea/the-girardi-oil-kaltegpresstes-extra-natives-biologisches-oliven%C3%B6l.jpg",
  family: "https://ik.imagekit.io/iu69j6qea/familieunternehmen-mutter-und-tochter-bei-den-eigenen-olivenb%C3%A4umen.jpg",
  oliveGrove: "https://ik.imagekit.io/iu69j6qea/olivenb%C3%A4ume-n%C3%A4he-kalamata-der-sorte-koroneiki.jpg",
  werkstatt: "https://ik.imagekit.io/iu69j6qea/werkstatt-direktverkauf-des-oliven%C3%B6ls-der-familie-girardi-in-innsbruck.jpg",
  hero1: "https://ik.imagekit.io/iu69j6qea/1763303598.jpg",
  hero2: "https://ik.imagekit.io/iu69j6qea/1763317156.jpg",
  hero3: "https://ik.imagekit.io/iu69j6qea/1763325998.jpg",
  gallery1: "https://ik.imagekit.io/iu69j6qea/image.jpg",
  gallery2: "https://ik.imagekit.io/iu69j6qea/image%20(1).jpg",
  gallery3: "https://ik.imagekit.io/iu69j6qea/image%20(2).jpg",
  gallery4: "https://ik.imagekit.io/iu69j6qea/image%20(3).jpg",
  gallery5: "https://ik.imagekit.io/iu69j6qea/image%20(4).jpg",
  gallery6: "https://ik.imagekit.io/iu69j6qea/image%20(5).jpg",
  gallery7: "https://ik.imagekit.io/iu69j6qea/image%20(7).jpg",
};

// Export images for use in other components
export { IK };

const bioDetails = [
  "EU-BIO zertifiziert",
  "Erste Kaltpressung",
  "Frisch gepresst & abgef\u00FCllt",
  "Sortenrein Koroneiki",
  "Von eigenen B\u00E4umen der Familie Girardi",
];

const extraNativDetails = [
  "Extra nativ",
  "Erste Kaltpressung",
  "Sortenrein Koroneiki",
  "Aus der Navarino-Bucht, Peloponnes",
  "2\u20133 Tage Lieferzeit",
];

const aromaDetails = [
  "Extra nativ mit nat\u00FCrlichem Aroma",
  "Kalt gepresst",
  "250 ml Glasflasche",
  "Ideal zum Verfeinern & Dippen",
];

const balsamDetails = [
  "Traditionell gereift",
  "Aus Griechenland",
  "250 ml Glasflasche",
  "Ideal f\u00FCr Salate & Marinaden",
];

export const products: Product[] = [
  // ─── BIO Oliven\u00F6l ───
  {
    id: "bio-1000",
    name: "BIO-Oliven\u00F6l Extra Nativ",
    subtitle: "Frisch Gepresst \u00B7 1 Liter",
    description:
      "Unser Herzst\u00FCck \u2013 Das Biologische Extra Native Oliven\u00F6l, von den eigenen B\u00E4umen der Familie Girardi! Hier bleibt von der Frucht bis zur Flasche alles in unserer Hand: Damit wir wissen, was Sie essen! Dieses \u00D6l wird direkt nach der Pressung in die Flaschen gef\u00FCllt. Frisch gepresstes Oliven\u00F6l ist eine selten zu erhaltene Delikatesse, die ein intensives Geschmacksaroma aufweist.",
    price: 22.5,
    size: "1 Liter",
    category: "bio",
    categoryLabel: "BIO Oliven\u00F6l",
    image: IK.girardiOil,
    badge: "Bestseller",
    inStock: true,
    details: bioDetails,
  },
  {
    id: "bio-500",
    name: "BIO-Oliven\u00F6l Extra Nativ",
    subtitle: "Frisch Gepresst \u00B7 500 ml",
    description:
      "Die handliche 500-ml-Flasche unseres preisgekr\u00F6nten BIO-Oliven\u00F6ls \u2013 perfekt zum Kennenlernen oder als Geschenk. Direkt nach der Pressung abgef\u00FCllt f\u00FCr maximale Frische.",
    price: 14.5,
    size: "500 ml",
    category: "bio",
    categoryLabel: "BIO Oliven\u00F6l",
    image: IK.gallery5,
    inStock: true,
    details: bioDetails,
  },

  // ─── Oliven\u00F6l Extra Nativ ───
  {
    id: "en-5000",
    name: "Oliven\u00F6l Extra Nativ",
    subtitle: "Kanister \u00B7 5 Liter",
    description:
      "Der gro\u00DFe 5-Liter-Kanister f\u00FCr Genie\u00DFer und Familien. Hochwertiges extra natives Oliven\u00F6l der Sorte Koroneiki aus Griechenland \u2013 ideal f\u00FCr den t\u00E4glichen Gebrauch in der K\u00FCche.",
    price: 69.9,
    size: "5 Liter",
    category: "extra-nativ",
    categoryLabel: "Oliven\u00F6l Extra Nativ",
    image: IK.gallery7,
    badge: "Vorteilspack",
    inStock: true,
    details: extraNativDetails,
  },
  {
    id: "en-1000",
    name: "Oliven\u00F6l Extra Nativ",
    subtitle: "Flasche \u00B7 1 Liter",
    description:
      "Unsere 1-Liter-Flasche mit hochwertigem extra nativen Oliven\u00F6l. Vollmundig, leicht pfeffrig im Abgang mit einer angenehmen Bitternote. Qualit\u00E4t von der Ernte bis zur Abf\u00FCllung.",
    price: 17.9,
    size: "1 Liter",
    category: "extra-nativ",
    categoryLabel: "Oliven\u00F6l Extra Nativ",
    image: IK.gallery1,
    inStock: true,
    details: extraNativDetails,
  },
  {
    id: "en-750",
    name: "Oliven\u00F6l Extra Nativ",
    subtitle: "Flasche \u00B7 0,75 Liter",
    description:
      "Die elegante 0,75-Liter-Flasche \u2013 perfekt als Geschenk oder f\u00FCr den eigenen Genuss. Erstklassiges griechisches Oliven\u00F6l der Sorte Koroneiki.",
    price: 14.9,
    size: "0,75 Liter",
    category: "extra-nativ",
    categoryLabel: "Oliven\u00F6l Extra Nativ",
    image: IK.gallery6,
    inStock: true,
    details: extraNativDetails,
  },

  // ─── Oliven\u00F6l mit Aroma ───
  {
    id: "aroma-basilikum",
    name: "Extra Natives Oliven\u00F6l Basilikum",
    subtitle: "Aromatisiert \u00B7 250 ml",
    description:
      "Feines extra natives Oliven\u00F6l, verfeinert mit nat\u00FCrlichem Basilikumaroma. Perfekt f\u00FCr italienische Gerichte, Caprese und frische Pasta.",
    price: 8.5,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery2,
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-blutorange",
    name: "Extra Natives Oliven\u00F6l Blutorange",
    subtitle: "Aromatisiert \u00B7 250 ml",
    description:
      "Fruchtig-frisches Oliven\u00F6l mit dem s\u00FC\u00DFlichen Aroma sizilianischer Blutorangen. Ideal f\u00FCr Salate, Desserts und Fischgerichte.",
    price: 8.5,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery3,
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-chili",
    name: "Extra Natives Oliven\u00F6l Chili",
    subtitle: "Aromatisiert \u00B7 Feurig & Pikant",
    description:
      "F\u00FCr alle die es scharf m\u00F6gen \u2013 extra natives Oliven\u00F6l mit einer angenehmen Chili-Sch\u00E4rfe. Perfekt f\u00FCr Pizza, Pasta und Grillgerichte.",
    price: 8.7,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery4,
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-knoblauch",
    name: "Extra Natives Oliven\u00F6l Knoblauch",
    subtitle: "Aromatisiert \u00B7 W\u00FCrzig & Kr\u00E4ftig",
    description:
      "Extra natives Oliven\u00F6l mit nat\u00FCrlichem Knoblaucharoma. Ideal zum Braten, f\u00FCr Pasta und zum Dippen mit frischem Brot.",
    price: 8.5,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery5,
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-trueffel",
    name: "Extra Natives Oliven\u00F6l Tr\u00FCffel",
    subtitle: "Aromatisiert \u00B7 Edel & Intensiv",
    description:
      "Luxuri\u00F6ses Oliven\u00F6l mit dem unverwechselbaren Aroma von Tr\u00FCffeln. Ein Hauch von Eleganz f\u00FCr Risotto, Pasta und feine Vorspeisen.",
    price: 8.9,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.girardiOil,
    badge: "Beliebt",
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-zitrone",
    name: "Extra Natives Oliven\u00F6l Zitrone",
    subtitle: "Aromatisiert \u00B7 Frisch & Sommerlich",
    description:
      "Unser extra natives Oliven\u00F6l, verfeinert mit nat\u00FCrlichem Zitronenextrakt. Perfekt f\u00FCr Fisch, Salate und Meeresfr\u00FCchte.",
    price: 8.5,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery6,
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-rosmarin",
    name: "Extra Natives Oliven\u00F6l Rosmarin",
    subtitle: "Aromatisiert \u00B7 Mediterran & Herb",
    description:
      "Mediterrane Aromen pur \u2013 feines Oliven\u00F6l mit nat\u00FCrlichem Rosmarinaroma. Perfekt f\u00FCr Focaccia, Kartoffeln und Grillgem\u00FCse.",
    price: 8.5,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery7,
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-oregano",
    name: "Extra Natives Oliven\u00F6l Oregano",
    subtitle: "Aromatisiert \u00B7 Griechisch & Aromatisch",
    description:
      "Der Geschmack Griechenlands in einer Flasche. Extra natives Oliven\u00F6l mit wildem Oregano \u2013 ideal f\u00FCr griechische Salate und Fleischgerichte.",
    price: 8.5,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery1,
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-limette",
    name: "Extra Natives Oliven\u00F6l Limette",
    subtitle: "Aromatisiert \u00B7 Exotisch & Erfrischend",
    description:
      "Erfrischend und exotisch \u2013 extra natives Oliven\u00F6l mit Limettenaroma. Perfekt f\u00FCr asiatische K\u00FCche, Ceviche und Salate.",
    price: 8.5,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery2,
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-orange",
    name: "Extra Natives Oliven\u00F6l Orange",
    subtitle: "Aromatisiert \u00B7 Fruchtig & Mild",
    description:
      "Mild-fruchtiges Oliven\u00F6l mit nat\u00FCrlichem Orangenaroma. Ideal f\u00FCr Desserts, Salate und zum Verfeinern von Gefl\u00FCgelgerichten.",
    price: 8.5,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery3,
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-pesto",
    name: "Extra Natives Oliven\u00F6l Pesto",
    subtitle: "Aromatisiert \u00B7 Italienisch & W\u00FCrzig",
    description:
      "Oliven\u00F6l mit dem aromatischen Geschmack von Pesto. Perfekt f\u00FCr Pasta, Bruschetta und als Dip mit frischem Brot.",
    price: 8.7,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery4,
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-thymian",
    name: "Extra Natives Oliven\u00F6l Thymian",
    subtitle: "Aromatisiert \u00B7 Herb & Mediterran",
    description:
      "Herbw\u00FCrziges Oliven\u00F6l mit nat\u00FCrlichem Thymianaroma. Ideal f\u00FCr Lamm, Gem\u00FCse und mediterrane Gerichte.",
    price: 8.5,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery5,
    inStock: true,
    details: aromaDetails,
  },
  {
    id: "aroma-kraeuter",
    name: "Extra Natives Oliven\u00F6l Kr\u00E4uter der Toskana",
    subtitle: "Aromatisiert \u00B7 Italienisch & Vielseitig",
    description:
      "Eine feine Komposition aus toskanischen Kr\u00E4utern und extra nativem Oliven\u00F6l. Vielseitig einsetzbar in der K\u00FCche.",
    price: 8.7,
    size: "250 ml",
    category: "aroma",
    categoryLabel: "Oliven\u00F6l mit Aroma",
    image: IK.gallery6,
    inStock: true,
    details: aromaDetails,
  },

  // ─── Balsamessig ───
  {
    id: "balsam-klassisch",
    name: "Balsamessig Klassisch",
    subtitle: "Traditionell gereift \u00B7 250 ml",
    description:
      "Unser klassischer Balsamessig aus Griechenland \u2013 samtiger, vollmundiger Geschmack. Der Allrounder f\u00FCr Salate, Marinaden und als Verfeinerung von Gerichten.",
    price: 8.0,
    size: "250 ml",
    category: "balsamessig",
    categoryLabel: "Balsamessig",
    image: IK.hero3,
    inStock: true,
    details: balsamDetails,
  },
  {
    id: "balsam-feige",
    name: "Balsamessig Feige",
    subtitle: "Fruchtig & S\u00FC\u00DF \u00B7 250 ml",
    description:
      "Aromatischer Balsamessig mit dem s\u00FC\u00DFen Geschmack reifer Feigen. Perfekt zu K\u00E4se, Salaten und gegrilltem Gem\u00FCse.",
    price: 8.4,
    size: "250 ml",
    category: "balsamessig",
    categoryLabel: "Balsamessig",
    image: IK.hero3,
    badge: "Beliebt",
    inStock: true,
    details: balsamDetails,
  },
  {
    id: "balsam-granatapfel",
    name: "Balsamessig Granatapfel",
    subtitle: "Fruchtig & S\u00E4uerlich \u00B7 250 ml",
    description:
      "S\u00E4uerlich-fruchtiger Balsamessig mit dem exotischen Geschmack von Granat\u00E4pfeln. Ideal f\u00FCr orientalische Salate und Marinaden.",
    price: 8.4,
    size: "250 ml",
    category: "balsamessig",
    categoryLabel: "Balsamessig",
    image: IK.hero3,
    inStock: true,
    details: balsamDetails,
  },
  {
    id: "balsam-honig",
    name: "Balsamessig Honig",
    subtitle: "S\u00FC\u00DF & Mild \u00B7 250 ml",
    description:
      "Samtiger Balsamessig mit nat\u00FCrlichem Honig verfeinert. Perfekt f\u00FCr Salatdressings und als Glasur f\u00FCr Gefl\u00FCgel.",
    price: 8.4,
    size: "250 ml",
    category: "balsamessig",
    categoryLabel: "Balsamessig",
    image: IK.hero3,
    inStock: true,
    details: balsamDetails,
  },
  {
    id: "balsam-mango",
    name: "Balsamessig Mango",
    subtitle: "Exotisch & Fruchtig \u00B7 250 ml",
    description:
      "Exotischer Balsamessig mit dem tropischen Geschmack reifer Mangos. Ideal f\u00FCr asiatisch inspirierte Gerichte und Salate.",
    price: 8.8,
    size: "250 ml",
    category: "balsamessig",
    categoryLabel: "Balsamessig",
    image: IK.hero3,
    inStock: true,
    details: balsamDetails,
  },
  {
    id: "balsam-himbeere",
    name: "Balsamessig Himbeere",
    subtitle: "Beerig & Frisch \u00B7 250 ml",
    description:
      "Fruchtig-frischer Balsamessig mit dem intensiven Geschmack von Himbeeren. Perfekt f\u00FCr Desserts und frische Salate.",
    price: 8.4,
    size: "250 ml",
    category: "balsamessig",
    categoryLabel: "Balsamessig",
    image: IK.hero3,
    inStock: true,
    details: balsamDetails,
  },
  {
    id: "balsam-apfel",
    name: "Balsamessig Apfel",
    subtitle: "Frisch & Herb \u00B7 250 ml",
    description:
      "Herb-fruchtiger Balsamessig mit dem frischen Geschmack von \u00C4pfeln. Vielseitig einsetzbar in der K\u00FCche.",
    price: 8.4,
    size: "250 ml",
    category: "balsamessig",
    categoryLabel: "Balsamessig",
    image: IK.hero3,
    inStock: true,
    details: balsamDetails,
  },
  {
    id: "balsam-kirsche",
    name: "Balsamessig Kirsche",
    subtitle: "S\u00FC\u00DF & Fruchtig \u00B7 250 ml",
    description:
      "Vollmundiger Balsamessig mit dem aromatischen Geschmack von Kirschen. Ideal zu Wild, K\u00E4se und Desserts.",
    price: 8.0,
    size: "250 ml",
    category: "balsamessig",
    categoryLabel: "Balsamessig",
    image: IK.hero3,
    inStock: true,
    details: balsamDetails,
  },
  {
    id: "balsam-weiss",
    name: "Balsamessig Weiss",
    subtitle: "Mild & Elegant · 250 ml",
    description:
      "Weißer Balsamessig aus Griechenland – mild, fruchtig und vielseitig einsetzbar. Perfekt für helle Saucen, Fischgerichte und Salate.",
    price: 8.4,
    size: "250 ml",
    category: "balsamessig",
    categoryLabel: "Balsamessig",
    image: IK.hero3,
    inStock: true,
    details: balsamDetails,
  },
  {
    id: "balsam-trueffel",
    name: "Balsamessig Trueffel",
    subtitle: "Edel & Aromatisch · 250 ml",
    description:
      "Exquisiter Balsamessig verfeinert mit dem unverwechselbaren Aroma schwarzer Trüffel. Ein Hauch von Luxus für Risotto, Pasta und feine Vorspeisen.",
    price: 9.5,
    size: "250 ml",
    category: "balsamessig",
    categoryLabel: "Balsamessig",
    image: IK.hero3,
    inStock: true,
    details: balsamDetails,
  },
];

export const categories = [
  { id: "all", label: "Alle Produkte" },
  { id: "bio", label: "BIO Oliven\u00F6l" },
  { id: "extra-nativ", label: "Extra Nativ" },
  { id: "aroma", label: "Mit Aroma" },
  { id: "balsamessig", label: "Balsamessig" },
];