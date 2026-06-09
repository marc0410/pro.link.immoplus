"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { submitAcquisition } from "@/lib/api";

/** Animate a number from 1 up to `target` over `duration` ms */
function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(1);
  const started = useRef(false);

  const start = useCallback(() => {
    if (started.current) return;
    started.current = true;
    const startTime = performance.now();
    function step(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(1 + eased * (target - 1)));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [target, duration]);

  return { count, start };
}

type ProfileType = "particulier" | "entreprise" | null;
type HasApp = "oui" | "non" | null;

interface FormData {
  nom: string;
  prenom: string;
  entreprise: string;
  activite: string;
  email: string;
  phone: string;
  countryCode: string;
}

type FormErrors = Partial<Record<keyof FormData | "profileType" | "hasApp", string>>;

const COUNTRIES = [
  { code: "+225", flag: "🇨🇮", label: "CI" },
  { code: "+33",  flag: "🇫🇷", label: "FR" },
  { code: "+221", flag: "🇸🇳", label: "SN" },
  { code: "+237", flag: "🇨🇲", label: "CM" },
  { code: "+223", flag: "🇲🇱", label: "ML" },
  { code: "+226", flag: "🇧🇫", label: "BF" },
  { code: "+224", flag: "🇬🇳", label: "GN" },
  { code: "+228", flag: "🇹🇬", label: "TG" },
  { code: "+229", flag: "🇧🇯", label: "BJ" },
  { code: "+227", flag: "🇳🇪", label: "NE" },
  { code: "+241", flag: "🇬🇦", label: "GA" },
  { code: "+242", flag: "🇨🇬", label: "CG" },
  { code: "+243", flag: "🇨🇩", label: "CD" },
  { code: "+212", flag: "🇲🇦", label: "MA" },
  { code: "+213", flag: "🇩🇿", label: "DZ" },
  { code: "+216", flag: "🇹🇳", label: "TN" },
  { code: "+32",  flag: "🇧🇪", label: "BE" },
  { code: "+41",  flag: "🇨🇭", label: "CH" },
  { code: "+1",   flag: "🇨🇦", label: "CA" },
  { code: "+44",  flag: "🇬🇧", label: "GB" },
];

/* Couleur de sélection active — teal profond */
const SEL = "#0F766E";
const SEL_BG = "#0F766E";

function inputBase(hasError: boolean) {
  return [
    "w-full px-4 py-2.5 text-sm text-[#111111] bg-[#F7F7F7]",
    "border-0 rounded-2xl outline-none placeholder-[#BBBBBB]",
    "transition-all duration-200 focus:bg-white focus:ring-2",
    hasError ? "ring-2 ring-red-200" : "focus:ring-[#2537DE]/15",
  ].join(" ");
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3.5 9l4 4L14.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v7M4 5.5L7 8.5l3-3M1.5 11h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SuccessState({ nom, prenom, reference }: { nom: string; prenom: string; reference: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center text-white"
        style={{ background: "linear-gradient(135deg, #2537DE 0%, #5B8DEF 100%)" }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M5 14l6 6L23 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold text-[#111111] tracking-tight">
          Demande envoyée !
        </h2>
        <p className="text-sm text-[#888] max-w-[220px] leading-relaxed">
          {prenom} {nom}, vous serez contacté sous 48h.
        </p>
      </div>
      <p className="text-[11px] text-[#ccc] font-mono tracking-wider">
        {reference}
      </p>
    </div>
  );
}

export function AcquisitionForm() {
  const [form, setForm] = useState<FormData>({
    nom: "",
    prenom: "",
    entreprise: "",
    activite: "",
    email: "",
    phone: "",
    countryCode: "+225",
  });
  const [profileType, setProfileType] = useState<ProfileType>(null);
  const [hasApp, setHasApp] = useState<HasApp>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    clearError(field);
  };

  const clearError = (field: keyof FormErrors) => {
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.nom.trim()) e.nom = "Requis";
    if (!form.prenom.trim()) e.prenom = "Requis";
    if (profileType === "entreprise" && !form.entreprise.trim()) e.entreprise = "Requis";
    if (!form.activite.trim()) e.activite = "Requis";
    if (!form.email.trim()) {
      e.email = "Requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Email invalide";
    }
    if (!form.phone.trim()) e.phone = "Requis";
    if (!profileType) e.profileType = "Choisissez un profil";
    if (!hasApp) e.hasApp = "Répondez à cette question";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError(null);

    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        activite: form.activite,
        email: form.email,
        telephone: { indicatif: form.countryCode, numero: form.phone },
        profil: profileType as "particulier" | "entreprise",
        appInstalle: hasApp === "oui",
        ...(profileType === "entreprise" ? { entreprise: form.entreprise } : {}),
      };

      const result = await submitAcquisition(payload);

      if (result.success) {
        setReference(result.reference);
        setSubmitted(true);
      } else {
        if (result.errors) {
          setErrors(result.errors as FormErrors);
        } else {
          setApiError(result.message ?? "Une erreur est survenue, réessayez.");
        }
      }
    } catch {
      setApiError("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <SuccessState nom={form.nom} prenom={form.prenom} reference={reference} />;

  return (
    <div
      ref={containerRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">

        {/* Nom + Prénom */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={form.nom}
              autoComplete="family-name"
              onChange={set("nom")}
              placeholder="Nom"
              className={inputBase(!!errors.nom)}
            />
            {errors.nom && <span className="text-[10px] text-red-400 px-1">{errors.nom}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={form.prenom}
              autoComplete="given-name"
              onChange={set("prenom")}
              placeholder="Prénom"
              className={inputBase(!!errors.prenom)}
            />
            {errors.prenom && <span className="text-[10px] text-red-400 px-1">{errors.prenom}</span>}
          </div>
        </div>

        {/* Profil — ici pour afficher le champ entreprise juste après */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] text-[#AAAAAA] px-1 font-medium tracking-wide uppercase">Profil</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "particulier" as ProfileType, label: "Indépendant", icon: "👤" },
              { value: "entreprise" as ProfileType, label: "Entreprise", icon: "🏢" },
            ].map(({ value, label, icon }) => {
              const active = profileType === value;
              return (
                <button
                  key={value as string}
                  type="button"
                  onClick={() => { setProfileType(value); clearError("profileType"); }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-2xl border transition-all duration-200 focus:outline-none text-sm font-medium"
                  style={{
                    borderColor: active ? SEL : "transparent",
                    background: active ? SEL_BG : "#F7F7F7",
                    color: active ? "#fff" : "#666",
                  }}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              );
            })}
          </div>
          {errors.profileType && <span className="text-[10px] text-red-400 px-1">{errors.profileType}</span>}
        </div>

        {/* Nom de l'entreprise — conditionnel */}
        {profileType === "entreprise" && (
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={form.entreprise}
              autoComplete="organization"
              onChange={set("entreprise")}
              placeholder="Nom de l'entreprise"
              className={inputBase(!!errors.entreprise)}
            />
            {errors.entreprise && <span className="text-[10px] text-red-400 px-1">{errors.entreprise}</span>}
          </div>
        )}

        {/* Activité */}
        <div className="flex flex-col gap-1">
          <input
            type="text"
            value={form.activite}
            onChange={set("activite")}
            placeholder="Activité · Agent, Promoteur, Notaire…"
            className={inputBase(!!errors.activite)}
          />
          {errors.activite && <span className="text-[10px] text-red-400 px-1">{errors.activite}</span>}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <input
            type="email"
            value={form.email}
            autoComplete="email"
            onChange={set("email")}
            placeholder="Adresse email"
            className={inputBase(!!errors.email)}
          />
          {errors.email && <span className="text-[10px] text-red-400 px-1">{errors.email}</span>}
        </div>

        {/* Téléphone — indicatif + numéro */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            {/* Sélecteur indicatif */}
            <div className="relative flex-shrink-0">
              <select
                value={form.countryCode}
                onChange={set("countryCode")}
                className="appearance-none h-full pl-3 pr-7 text-sm text-[#111111] bg-[#F7F7F7] rounded-2xl outline-none focus:ring-2 focus:ring-[#2537DE]/15 focus:bg-white transition-all duration-200 cursor-pointer"
                style={{ minWidth: 82 }}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code + c.label} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              {/* chevron */}
              <svg
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                width="10" height="10" viewBox="0 0 10 10" fill="none"
              >
                <path d="M2 3.5L5 6.5L8 3.5" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Numéro */}
            <div className="flex-1">
              <input
                type="tel"
                value={form.phone}
                autoComplete="tel-national"
                onChange={set("phone")}
                placeholder="07 XX XX XX XX"
                className={inputBase(!!errors.phone)}
              />
            </div>
          </div>
          {errors.phone && <span className="text-[10px] text-red-400 px-1">{errors.phone}</span>}
        </div>

        {/* Application ImmoPro */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] text-[#AAAAAA] px-1 font-medium tracking-wide uppercase">Application ImmoPro</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "oui" as HasApp, label: "✓ Installée" },
              { value: "non" as HasApp, label: "Pas encore" },
            ].map(({ value, label }) => {
              const active = hasApp === value;
              return (
                <button
                  key={value as string}
                  type="button"
                  onClick={() => { setHasApp(value); clearError("hasApp"); }}
                  className="py-2.5 rounded-2xl border transition-all duration-200 focus:outline-none text-sm font-medium"
                  style={{
                    borderColor: active ? SEL : "transparent",
                    background: active ? SEL_BG : "#F7F7F7",
                    color: active ? "#fff" : "#666",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {errors.hasApp && <span className="text-[10px] text-red-400 px-1">{errors.hasApp}</span>}

          {hasApp === "non" && (
            <a
              href="https://onelink.to/immopluspro"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold w-fit transition-all duration-200 active:scale-[0.97]"
              style={{ background: "#2537DE", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1b2db0")}
              onMouseLeave={e => (e.currentTarget.style.background = "#2537DE")}
            >
              <IconDownload />
              Télécharger
            </a>
          )}

          {hasApp === "oui" && (
            <div
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl w-fit text-[12px] font-medium"
              style={{ background: "#EDF3EC", color: "#346538" }}
            >
              <IconCheck />
              Déjà installée
            </div>
          )}
        </div>

        {/* Social proof */}
        <SocialProof />

        {/* Erreur API */}
        {apiError && (
          <p className="text-[11px] text-red-400 text-center px-1">{apiError}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-1 text-sm font-semibold rounded-2xl transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "#2537DE", color: "#FFFFFF" }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#1b2db0"; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#2537DE"; }}
        >
          {loading ? "Envoi en cours…" : "Envoyer le formulaire →"}
        </button>
      </form>
    </div>
  );
}

function SocialProof() {
  const { count, start } = useCountUp(1000, 1800);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) start(); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [start]);

  return (
    <div ref={ref} className="flex items-center gap-2.5 px-1 mt-1">
      {/* Avatars empilés */}
      <div className="flex -space-x-2 flex-shrink-0">
        {[
          { initials: "AK", bg: "#E8D5C4", color: "#7A4F2E" },
          { initials: "MB", bg: "#D4E8D5", color: "#2E6B35" },
          { initials: "YD", bg: "#D5D4E8", color: "#3A2E6B" },
          { initials: "+3", bg: "#F0F0F0", color: "#999999" },
        ].map(({ initials, bg, color }, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold flex-shrink-0"
            style={{ background: bg, color }}
          >
            {initials}
          </div>
        ))}
      </div>
      {/* Texte avec compteur animé */}
      <p className="text-[10.5px] text-[#AAAAAA] leading-tight">
        <span className="font-semibold text-[#888]">+{count} pros</span> déjà inscrits cette semaine
      </p>
    </div>
  );
}
