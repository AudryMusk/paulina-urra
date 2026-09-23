import { Reveal } from "../Reveal";
import { wrap } from "../ui";

const piliers = [
  { titre: "Vendre", texte: "Une mise en marché\nsoignée" },
  { titre: "Acheter", texte: "Un accompagnement\npersonnalisé" },
  { titre: "Évaluer", texte: "Une analyse de\nvotre marché" },
  { titre: "Échanger", texte: "En français\net en anglais" },
];

export function Piliers() {
  return (
    <section className="bg-navy text-white">
      <div className={`${wrap} grid grid-cols-2 gap-6 py-10 lg:flex lg:items-center`}>
        <Reveal depuis="haut" className="col-span-2 lg:w-56 lg:shrink-0">
          <p className="whitespace-pre-line font-serif text-2xl leading-snug">{"À vos côtés,\nà chaque étape."}</p>
        </Reveal>
        {piliers.map((pilier, i) => (
          <Reveal
            key={pilier.titre}
            delai={100 + i * 100}
            className="flex flex-1 flex-col gap-2.5 border-l border-white/15 pl-6"
          >
            <p className="font-serif text-[26px]">{pilier.titre}</p>
            <p className="whitespace-pre-line text-lg leading-snug text-white/85">{pilier.texte}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
