import { useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle,
  Circle,
  ExternalLink,
  Copy,
  Check,
  Server,
  Database,
  Clock,
  Globe,
  CreditCard,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useBackendStatus } from "../api/use-backend-status";
import { SEOHead } from "../SEOHead";

interface Step {
  id: string;
  phase: string;
  title: string;
  description: string;
  commands?: string[];
  links?: { label: string; url: string }[];
  notes?: string[];
  envVars?: { key: string; example: string }[];
}

const steps: Step[] = [
  {
    id: "neon",
    phase: "Phase 1 – Datenbank",
    title: "1. Neon PostgreSQL einrichten",
    description:
      "Erstelle eine kostenlose PostgreSQL-Datenbank auf Neon für Medusa.",
    links: [
      { label: "Neon Console", url: "https://console.neon.tech" },
    ],
    notes: [
      "Registriere dich auf neon.tech (GitHub Login möglich)",
      "Erstelle ein neues Projekt: \"girardi-oil-db\"",
      "Wähle Region: eu-central-1 (Frankfurt) für niedrige Latenz",
      "Kopiere den Connection String (postgres://...)",
      "Free Tier: 0.5 GB Storage, 190h Compute/Monat",
    ],
    envVars: [
      {
        key: "DATABASE_URL",
        example: "postgres://user:pass@ep-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require",
      },
    ],
  },
  {
    id: "medusa-setup",
    phase: "Phase 2 – Medusa Backend",
    title: "2. Medusa.js Projekt erstellen",
    description:
      "Erstelle ein neues Medusa v2 Backend-Projekt lokal und konfiguriere es.",
    commands: [
      "npx create-medusa-app@latest girardi-oil-backend",
      "cd girardi-oil-backend",
      "# .env anpassen mit Neon DB URL:",
      "# DATABASE_URL=postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require",
      "npx medusa db:migrate",
      "npx medusa seed --seed-file=./src/scripts/seed.ts",
      "npx medusa develop",
    ],
    notes: [
      "Wähle bei der Installation: PostgreSQL (nicht SQLite)",
      "Admin-Dashboard läuft auf http://localhost:9000/app",
      "Store API auf http://localhost:9000/store",
      "Erstelle einen Admin-User beim ersten Start",
    ],
  },
  {
    id: "medusa-config",
    phase: "Phase 2 – Medusa Backend",
    title: "3. Medusa für Girardi Oil konfigurieren",
    description:
      "Produkte, Regionen und Versandoptionen im Medusa Admin einrichten.",
    notes: [
      "Admin → Regionen: Erstelle \"Österreich\" Region (EUR, AT/DE/CH/IT)",
      "Admin → Versandoptionen: \"Standardversand\" (5,90€) + \"Kostenlos ab 50€\" (0€)",
      "Admin → Versandoptionen: \"Abholung Innsbruck\" (0€, Typ: Abholung)",
      "Admin → Produkte: Alle 27 Produkte anlegen mit korrekten Preisen & Bildern",
      "Admin → Zahlungsanbieter: PayPal Plugin + Manuelle Zahlung (Vorkasse/Bar)",
      "Tipp: Du kannst Produkte auch per Seed-Script importieren",
    ],
  },
  {
    id: "medusa-payments",
    phase: "Phase 2 – Medusa Backend",
    title: "4. Zahlungsanbieter einrichten",
    description:
      "PayPal und manuelle Zahlungsmethoden (Vorkasse, Barzahlung) konfigurieren.",
    commands: [
      "# PayPal Plugin installieren:",
      "npm install medusa-payment-paypal",
      "# In medusa-config.ts unter plugins hinzufügen:",
      "# { resolve: 'medusa-payment-paypal',",
      "#   options: {",
      "#     clientId: process.env.PAYPAL_CLIENT_ID,",
      "#     clientSecret: process.env.PAYPAL_CLIENT_SECRET,",
      "#     sandbox: true,  // false für Produktion",
      "#   }",
      "# }",
    ],
    envVars: [
      { key: "PAYPAL_CLIENT_ID", example: "AxxxxxxxxxxxxxxxxxxxxxxxxxxxxB" },
      { key: "PAYPAL_CLIENT_SECRET", example: "ExxxxxxxxxxxxxxxxxxxxxxxxxxxxF" },
    ],
    notes: [
      "PayPal Business-Konto auf developer.paypal.com erstellen",
      "Sandbox Credentials für Testphase verwenden",
      "Manuelle Zahlung (Vorkasse/Bar) ist in Medusa v2 standardmäßig verfügbar",
      "Im Admin unter Regionen → Zahlungsanbieter aktivieren",
    ],
  },
  {
    id: "render",
    phase: "Phase 3 – Deployment",
    title: "5. Backend auf Render deployen",
    description:
      "Deploye das Medusa Backend auf Render's Free Tier als Web Service.",
    links: [
      { label: "Render Dashboard", url: "https://dashboard.render.com" },
    ],
    notes: [
      "Erstelle ein GitHub Repo für das Backend: \"girardi-oil-backend\"",
      "Pushe den Code nach GitHub",
      "Auf Render: \"New Web Service\" → GitHub Repo verbinden",
      "Runtime: Node, Build: npm install && npm run build, Start: npm run start",
      "Free Tier: 750h/Monat, schläft nach 15min Inaktivität",
      "Environment Variables setzen (siehe unten)",
    ],
    envVars: [
      {
        key: "DATABASE_URL",
        example: "postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require",
      },
      { key: "MEDUSA_ADMIN_ONBOARDING_TYPE", example: "default" },
      { key: "STORE_CORS", example: "https://1000horia.at,https://your-app.vercel.app" },
      { key: "ADMIN_CORS", example: "https://your-medusa-app.onrender.com" },
      { key: "AUTH_CORS", example: "https://your-medusa-app.onrender.com" },
      { key: "COOKIE_SECRET", example: "your-random-cookie-secret-min-32-chars" },
      { key: "JWT_SECRET", example: "your-random-jwt-secret-min-32-chars" },
      { key: "PAYPAL_CLIENT_ID", example: "AxxxxxxxxxxxxxxxxxxxxxxxxxxxxB" },
      { key: "PAYPAL_CLIENT_SECRET", example: "ExxxxxxxxxxxxxxxxxxxxxxxxxxxxF" },
    ],
  },
  {
    id: "cronjob",
    phase: "Phase 3 – Deployment",
    title: "6. Sleep Prevention mit cron-job.org",
    description:
      "Render Free Tier schläft nach 15 Minuten ein. Ein Cron-Job pingt den Health-Endpoint alle 14 Minuten.",
    links: [
      { label: "cron-job.org", url: "https://cron-job.org" },
    ],
    notes: [
      "Registriere dich kostenlos auf cron-job.org",
      "Neuer Cron-Job erstellen:",
      "  URL: https://your-medusa-app.onrender.com/health",
      "  Methode: GET",
      "  Zeitplan: Alle 14 Minuten (*/14 * * * *)",
      "  Aktiviere Benachrichtigung bei Fehlern (optional)",
      "Erster Cold-Start nach Deploy dauert ~30 Sekunden",
      "Danach bleibt der Service dank Cron-Job wach",
      "ACHTUNG: Free Tier hat 750h/Monat – reicht für ~31 Tage 24/7",
    ],
  },
  {
    id: "frontend-env",
    phase: "Phase 4 – Frontend verbinden",
    title: "7. Frontend mit Backend verbinden",
    description:
      "Setze die Umgebungsvariablen in Vercel, damit das Frontend das Medusa Backend nutzt.",
    notes: [
      "In Vercel → Project Settings → Environment Variables:",
      "Diese Variablen aktivieren automatisch den Backend-Modus",
      "Das Frontend fällt automatisch auf lokalen Modus zurück wenn Backend offline",
      "Teste mit ?debug=1 in der URL – zeigt Backend-Status-Badge",
    ],
    envVars: [
      {
        key: "VITE_MEDUSA_BACKEND_URL",
        example: "https://your-medusa-app.onrender.com",
      },
      {
        key: "VITE_MEDUSA_PUBLISHABLE_KEY",
        example: "pk_xxxxxxxxxxxxxxxxxxxxxxx",
      },
    ],
  },
  {
    id: "golive",
    phase: "Phase 5 – Go Live",
    title: "8. Go Live Checkliste",
    description: "Letzte Schritte vor dem Launch.",
    notes: [
      "PayPal von Sandbox auf Live umstellen",
      "Alle 27 Produkte im Medusa Admin prüfen (Preise, Bilder, Lagerbestand)",
      "Testbestellung mit jeder Zahlungsmethode durchführen",
      "E-Mail-Templates in Medusa konfigurieren (Bestellbestätigung)",
      "STORE_CORS auf finale Domain beschränken",
      "Cookie-Banner Datenschutztext finalisieren",
      "Google Search Console einrichten + Sitemap",
      "Domain 1000horia.at auf Vercel zeigen lassen",
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="p-1 hover:bg-olive-100 rounded transition-colors shrink-0"
      title="Kopieren"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-olive-500" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

export function SetupGuidePage() {
  const { status, latency } = useBackendStatus();
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem("tgo_setup_progress") || "[]"))
  );

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("tgo_setup_progress", JSON.stringify([...next]));
      return next;
    });
  };

  const progress = Math.round((completed.size / steps.length) * 100);

  return (
    <div className="bg-cream min-h-screen py-12">
      <SEOHead title="Setup Guide – Medusa Backend" canonical="/setup" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-gold-500 text-sm tracking-[0.2em] uppercase">
            Developer Guide
          </span>
          <h1
            className="text-3xl sm:text-4xl mt-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Medusa.js Backend Setup
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Schritt-für-Schritt Anleitung zum Aufsetzen des kostenlosen
            E-Commerce-Stacks: Medusa.js + Render + Neon DB + cron-job.org
          </p>
        </div>

        {/* Status + Progress */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Server className="w-5 h-5 text-olive-500" />
              <span className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                Backend Status
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  status === "online"
                    ? "bg-emerald-400"
                    : status === "offline"
                    ? "bg-red-400"
                    : status === "checking"
                    ? "bg-yellow-400 animate-pulse"
                    : "bg-gray-300"
                }`}
              />
              <span className="text-sm">
                {status === "online" && `Online (${latency}ms)`}
                {status === "offline" && "Offline / Nicht erreichbar"}
                {status === "checking" && "Verbindung wird geprüft..."}
                {status === "unconfigured" && "Nicht konfiguriert (Lokal-Modus)"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-olive-500" />
              <span className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                Setup-Fortschritt
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-cream-dark rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-olive-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {completed.size}/{steps.length}
              </span>
            </div>
          </div>
        </div>

        {/* Architecture Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-10">
          <h2
            className="text-lg mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Architektur-Übersicht
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Globe, label: "Frontend", sub: "Vercel (Free)", color: "text-blue-500" },
              { icon: Server, label: "Backend", sub: "Render (Free)", color: "text-purple-500" },
              { icon: Database, label: "Datenbank", sub: "Neon (Free)", color: "text-emerald-500" },
              { icon: Clock, label: "Cron-Job", sub: "cron-job.org", color: "text-orange-500" },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-cream rounded-lg">
                <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                <p className="text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              PayPal + Vorkasse + Barzahlung bei Abholung
            </span>
            <span className="mx-2 text-muted-foreground">|</span>
            <Truck className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Versand + Abholung Innsbruck
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, i) => {
            const isDone = completed.has(step.id);
            const prevPhase = i > 0 ? steps[i - 1].phase : "";
            const showPhase = step.phase !== prevPhase;

            return (
              <div key={step.id}>
                {showPhase && (
                  <h3
                    className="text-sm tracking-[0.15em] uppercase text-gold-500 mt-8 mb-3"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {step.phase}
                  </h3>
                )}

                <motion.div
                  layout
                  className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 transition-colors ${
                    isDone ? "border-olive-500" : "border-transparent"
                  }`}
                >
                  <div className="p-5 sm:p-6">
                    {/* Title row */}
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggle(step.id)}
                        className="mt-0.5 shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle className="w-5 h-5 text-olive-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3
                          className={`text-base ${isDone ? "line-through text-muted-foreground" : ""}`}
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Commands */}
                    {step.commands && (
                      <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-100">
                          {step.commands.map((cmd, ci) => (
                            <div
                              key={ci}
                              className={`flex items-center gap-2 ${
                                cmd.startsWith("#") ? "text-gray-500" : ""
                              }`}
                            >
                              {!cmd.startsWith("#") && (
                                <span className="text-olive-300 select-none">$</span>
                              )}
                              <span className="flex-1">{cmd}</span>
                              {!cmd.startsWith("#") && <CopyButton text={cmd} />}
                            </div>
                          ))}
                        </pre>
                      </div>
                    )}

                    {/* Env Vars */}
                    {step.envVars && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Environment Variables
                        </p>
                        {step.envVars.map((ev) => (
                          <div
                            key={ev.key}
                            className="flex items-center gap-2 bg-cream rounded-lg px-3 py-2"
                          >
                            <code className="text-xs text-olive-600 shrink-0">
                              {ev.key}
                            </code>
                            <span className="text-xs text-muted-foreground">=</span>
                            <code className="text-xs text-muted-foreground truncate flex-1">
                              {ev.example}
                            </code>
                            <CopyButton text={`${ev.key}=${ev.example}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {step.notes && (
                      <ul className="mt-4 space-y-1.5">
                        {step.notes.map((note, ni) => (
                          <li
                            key={ni}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="text-olive-400 mt-1 shrink-0">
                              &bull;
                            </span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Links */}
                    {step.links && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {step.links.map((link) => (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-olive-500 hover:text-olive-600 bg-olive-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Kostenübersicht */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-10">
          <h2
            className="text-lg mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Kostenübersicht (monatlich)
          </h2>
          <div className="space-y-3">
            {[
              { service: "Vercel (Frontend)", cost: "0 €", note: "Hobby Plan" },
              { service: "Render (Medusa Backend)", cost: "0 €", note: "Free Tier, 750h/Monat" },
              { service: "Neon (PostgreSQL)", cost: "0 €", note: "Free Tier, 0.5 GB" },
              { service: "cron-job.org", cost: "0 €", note: "Free Plan" },
              { service: "ImageKit (Bilder)", cost: "0 €", note: "Free Tier, 20 GB Bandbreite" },
              { service: "PayPal", cost: "2,49% + 0,35€", note: "Pro Transaktion" },
            ].map((item) => (
              <div
                key={item.service}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm">{item.service}</p>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
                <span className="text-sm text-olive-500">{item.cost}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span style={{ fontFamily: "var(--font-heading)" }}>
              Fixkosten gesamt
            </span>
            <span
              className="text-xl text-olive-500"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              0 €/Monat
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
