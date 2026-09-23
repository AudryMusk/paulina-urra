import type { ReactNode } from "react";

export const wrap = "mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-16";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-4 text-base font-medium tracking-[0.16em] text-muted ${className}`}>
      <span className="h-0.5 w-11 bg-red" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeader({ label, title, intro }: { label: string; title: string; intro: string }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-24">
      <p className="text-base font-semibold tracking-[0.16em] text-red lg:w-40 lg:shrink-0">{label}</p>
      <div className="flex flex-col gap-5">
        <h2 className="whitespace-pre-line font-serif text-4xl leading-[1.1] lg:text-5xl">{title}</h2>
        <p className="max-w-[640px] text-xl leading-relaxed text-muted">{intro}</p>
      </div>
    </div>
  );
}

export function Courriel({ adresse }: { adresse: string }) {
  const [local, domaine] = adresse.split("@");
  return (
    <>
      {local}
      <wbr />
      <span className="whitespace-nowrap">@{domaine}</span>
    </>
  );
}
