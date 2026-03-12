import { motion } from "motion/react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { IK } from "../productData";
import { SEOHead } from "../SEOHead";

const IMG_GROVE = IK.oliveGrove;
const IMG_HARVEST = IK.family;
const IMG_OIL = IK.girardiOil;

const timeline = [
  { year: "2012", title: "Die Gründung", text: "Monika Girardi bringt erstmals griechisches Olivenöl nach Tirol und gründet die Firma." },
  { year: "2015", title: "Eigene Haine", text: "Die Familie erwirbt eigene Olivenhaine nahe Kalamata auf dem Peloponnes." },
  { year: "2018", title: "BIO Zertifizierung", text: "Unsere Haine erhalten das europäische BIO-Zertifikat für biologischen Anbau." },
  { year: "2020", title: "The Girardi Oil", text: "Die Marke \u201EThe Girardi Oil\u201C mit dem charakteristischen G entsteht." },
  { year: "2024", title: "Die Werkstatt", text: "Eröffnung des Direktverkaufs in Innsbruck mit Verkostungsmöglichkeit." },
];

export function AboutPage() {
  return (
    <div>
      <SEOHead
        title="Unsere Geschichte"
        description="Familie Girardi aus Tirol – seit 2012 pflegen wir unsere Olivenbäume der Sorte Koroneiki auf dem Peloponnes. BIO-zertifiziert, kalt gepresst, in Handarbeit."
        canonical="/unsere-geschichte"
      />
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={IMG_GROVE}
            alt="Olivenhaine auf dem Peloponnes"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-olive-900/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold-300 text-sm tracking-[0.2em] uppercase">
              Familie Girardi
            </span>
            <h1
              className="text-4xl sm:text-5xl text-white mt-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Unsere Geschichte
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2
              className="text-3xl sm:text-4xl mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Von Tirol nach Griechenland
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Alles begann als Monika Girardi einen griechischen Freund
              unterstützen wollte und sein Olivenöl nach Tirol brachte. Die
              Begeisterung war so groß, dass sie 2012 die Firma gründete. Heute
              bewirtschaften wir eigene Olivenhaine und produzieren erstklassiges
              biologisches extra natives Olivenöl.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Image + Text */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ImageWithFallback
                src={IMG_HARVEST}
                alt="Olivenernte"
                className="w-full rounded-2xl object-cover aspect-[4/3]"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3
                className="text-2xl sm:text-3xl mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Unsere Haine
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Unsere Olivenhaine befinden sich in der Nähe von Kalamata am
                Peloponnes. Die Olivenbäume werden von uns das ganze Jahr
                liebevoll gehegt und gepflegt.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Diese Pflege, ein sorgfältiger Schnitt im Frühjahr und der
                reichhaltige Boden sind wichtig, damit die Bäume im Herbst
                besonders aromatische Früchte tragen.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Der Großteil unserer Bäume trägt das europäische BIO-Zertifikat!
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Girardi Oil Brand */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <h3
                className="text-2xl sm:text-3xl mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                The Girardi Oil
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ursprünglich haben wir nur die Marke 1000 Horia – Olivenöl der
                feinen Art vertrieben. Mittlerweile bewirtschaften wir unsere
                eigenen Olivenhaine und produzieren erstklassiges biologisches
                extra natives Olivenöl.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Dies unter dem charakteristischen &bdquo;G&ldquo;, das vom Familiennamen
                Girardi stammt und auch eine Olive sowie einen Olivenbaum
                darstellt.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Daneben arbeiten wir mit lokalen Partnern zusammen, welche die
                gleiche Philosophie wie wir verfolgen. Alle Olivenöle stammen
                aus der ersten Kaltpressung und sind extra nativ – das ist für
                uns eine Selbstverständlichkeit!
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <ImageWithFallback
                src={IMG_OIL}
                alt="The Girardi Oil"
                className="w-full rounded-2xl object-cover aspect-[4/3]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-gold-500 text-sm tracking-[0.2em] uppercase">
              Unsere Meilensteine
            </span>
            <h2
              className="text-3xl sm:text-4xl mt-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Der Weg bis heute
            </h2>
          </motion.div>
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-16 pb-10 border-l-2 border-olive-200 last:border-transparent"
              >
                <div className="absolute left-0 -translate-x-1/2 w-10 h-10 bg-olive-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">{item.year}</span>
                </div>
                <h4
                  className="text-lg mb-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {item.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-olive-500 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2
            className="text-3xl text-white mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Überzeugen Sie sich selbst
          </h2>
          <p className="text-white/70 mb-8">
            Probieren Sie unser Olivenöl – direkt von unseren Hainen zu Ihnen
            nach Hause.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-gold-400 text-white px-8 py-3.5 rounded-lg hover:bg-gold-500 transition-colors"
          >
            Zum Shop
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}