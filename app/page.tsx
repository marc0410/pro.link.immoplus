import { AcquisitionForm } from "./components/AcquisitionForm";
import { ImmoLogo } from "./components/ImmoLogo";

export default function Page() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-[#F0F0F0] px-5 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <ImmoLogo />
          <a
            href="#"
            className="text-xs font-medium text-[#AAAAAA] hover:text-[#111111] transition-colors"
          >
            Déjà inscrit ?
          </a>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-4 sm:px-6 sm:py-14 relative overflow-hidden">
        {/* Soft blue ambient */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(37,55,222,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="w-full max-w-[420px] relative z-10">

          {/* Heading */}
          <div className="mb-4 sm:mb-6 text-center">
            <h1
              className="text-[24px] sm:text-[30px] font-bold text-[#111111] leading-tight tracking-tight"
              style={{ letterSpacing: "-0.025em" }}
            >
              Espace <span>Immo</span><span style={{ color: "#2537DE" }}>+</span><span> Pro</span>
            </h1>
            <p className="mt-1.5 text-sm text-[#999] leading-relaxed">
              Rejoignez <span className="font-semibold" style={{ color: "#2537DE" }}>Immo+</span> pour faciliter la gestion de votre parc immobilier.
            </p>
          </div>

          {/* Form card */}
          <div
            className="rounded-3xl border bg-white p-4 sm:p-6"
            style={{ borderColor: "#F0F0F0", boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}
          >
            <AcquisitionForm />
          </div>

          {/* Footer note — desktop only */}
          <div className="hidden sm:flex mt-6 items-center justify-center gap-5">
            <div className="flex items-center gap-1.5 text-[11px] text-[#CCCCCC]">
              <LockIcon />
              Données sécurisées
            </div>
            <div className="w-px h-3 bg-[#EEEEEE]" />
            <div className="flex items-center gap-1.5 text-[11px] text-[#CCCCCC]">
              <ShieldIcon />
              Conformité RGPD
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <rect x="1.5" y="5" width="8" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1" />
      <path d="M3.5 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.5 1L1.5 2.5V5.5c0 2.2 1.7 4 4 4.5 2.3-.5 4-2.3 4-4.5V2.5L5.5 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M3.5 5.5l1.5 1.5 2.5-2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
