"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type Direction = "haut" | "droite" | "gauche" | "rideau";

const cache: Record<Direction, string> = {
  haut: "-translate-y-8 opacity-0",
  droite: "translate-x-16 opacity-0",
  gauche: "-translate-x-16 opacity-0",
  rideau: "[clip-path:inset(0_0_0_100%)]",
};

const visible: Record<Direction, string> = {
  haut: "translate-y-0 opacity-100",
  droite: "translate-x-0 opacity-100",
  gauche: "translate-x-0 opacity-100",
  rideau: "[clip-path:inset(0_0_0_0)]",
};

export function Reveal({
  children,
  depuis = "droite",
  delai = 0,
  className = "",
}: {
  children: ReactNode;
  depuis?: Direction;
  delai?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [estVisible, setEstVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return;
        setEstVisible(true);
        observateur.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  const transition =
    depuis === "rideau" ? "transition-[clip-path] duration-[1400ms]" : "transition-[opacity,translate] duration-1000";

  return (
    <div
      ref={ref}
      data-visible={estVisible}
      style={{ transitionDelay: `${delai}ms` }}
      className={`group/reveal ${transition} ease-doux ${estVisible ? visible[depuis] : cache[depuis]} ${className}`}
    >
      {children}
    </div>
  );
}
