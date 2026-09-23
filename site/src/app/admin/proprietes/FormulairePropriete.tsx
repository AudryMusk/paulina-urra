"use client";

import Image from "next/image";
import { startTransition, useActionState, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus } from "lucide-react";
import type { ProprieteDonnees } from "@/lib/proprietes-affichage";
import { sauvegarderPropriete } from "./actions";

const COTE_MAX = 2400;

async function preparerPhoto(fichier: File) {
  const image = await createImageBitmap(fichier);
  const echelle = Math.min(1, COTE_MAX / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * echelle);
  canvas.height = Math.round(image.height * echelle);
  canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resoudre) => canvas.toBlob(resoudre, "image/jpeg", 0.9));
  if (!blob) throw new Error("Conversion impossible");
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

export function FormulairePropriete({ propriete }: { propriete?: ProprieteDonnees }) {
  const [state, action, pending] = useActionState(sauvegarderPropriete, {});
  const [apercu, setApercu] = useState<string | null>(propriete ? `/photos/${propriete.photo_id}` : null);
  const [erreurPhoto, setErreurPhoto] = useState<string | null>(null);
  const [preparation, setPreparation] = useState(false);
  const valeur = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));

  const choisirPhoto = async (ev: ChangeEvent<HTMLInputElement>) => {
    const fichier = ev.target.files?.[0];
    setErreurPhoto(null);
    if (!fichier) return;
    setPreparation(true);
    try {
      const prete = await preparerPhoto(fichier);
      const transfert = new DataTransfer();
      transfert.items.add(prete);
      ev.target.files = transfert.files;
      setApercu(URL.createObjectURL(prete));
    } catch {
      ev.target.value = "";
      setErreurPhoto("Ce format d’image n’est pas pris en charge. Utilisez une photo JPEG, PNG ou WebP.");
    } finally {
      setPreparation(false);
    }
  };

  const envoyer = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const donnees = new FormData(ev.currentTarget);
    const photo = donnees.get("photo");
    if (!propriete && !(photo instanceof File && photo.size > 0)) {
      setErreurPhoto("Ajoutez une photo de la propriété.");
      return;
    }
    startTransition(() => action(donnees));
  };

  return (
    <form onSubmit={envoyer} className="bo-form">
      {propriete && <input type="hidden" name="id" value={propriete.id} />}

      <div className="bo-photo-field">
        <div className="bo-photo-preview">
          {apercu ? (
            <Image src={apercu} alt="Aperçu de la photo" fill unoptimized className="bo-photo-img" />
          ) : (
            <span>Aucune photo</span>
          )}
        </div>
        <label className="bo-button bo-secondary bo-photo-button">
          <ImagePlus size={18} />
          {preparation ? "Préparation…" : apercu ? "Remplacer la photo" : "Choisir une photo"}
          <input
            className="bo-sr"
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            onChange={choisirPhoto}
          />
        </label>
        {erreurPhoto && (
          <p className="bo-error" role="alert">
            {erreurPhoto}
          </p>
        )}
      </div>

      <fieldset className="bo-radios">
        <legend>Situation</legend>
        <label>
          <input type="radio" name="etat" value="vendu" defaultChecked={propriete?.etat !== "a_vendre"} />
          Vendue
        </label>
        <label>
          <input type="radio" name="etat" value="a_vendre" defaultChecked={propriete?.etat === "a_vendre"} />À vendre
        </label>
      </fieldset>

      <label>
        Mention affichée au-dessus du prix
        <input
          name="mention"
          maxLength={80}
          defaultValue={propriete?.mention}
          placeholder="Ex. Vendu en 21 jours, Nouveau sur le marché"
        />
      </label>

      <div className="bo-two">
        <label>
          Prix (vendu ou affiché)
          <input name="prix" inputMode="numeric" required defaultValue={valeur(propriete?.prix)} placeholder="749000" />
        </label>
        <label>
          Prix demandé (facultatif)
          <input
            name="prix_demande"
            inputMode="numeric"
            defaultValue={valeur(propriete?.prix_demande)}
            placeholder="739000"
          />
        </label>
      </div>

      <div className="bo-two">
        <label>
          Adresse
          <input
            name="adresse"
            required
            maxLength={200}
            defaultValue={propriete?.adresse}
            placeholder="93, rue Monseigneur-Taché"
          />
        </label>
        <label>
          Ville
          <input name="ville" required maxLength={100} defaultValue={propriete?.ville} placeholder="Boucherville" />
        </label>
      </div>

      <label>
        Type de propriété (facultatif)
        <input
          name="type_propriete"
          maxLength={80}
          defaultValue={propriete?.type_propriete}
          placeholder="Maison à paliers multiples"
        />
      </label>

      <div className="bo-three">
        <label>
          Superficie (pi²)
          <input name="superficie" inputMode="numeric" defaultValue={valeur(propriete?.superficie)} />
        </label>
        <label>
          Chambres
          <input name="chambres" inputMode="numeric" defaultValue={valeur(propriete?.chambres)} />
        </label>
        <label>
          Salles de bain
          <input name="salles_de_bain" inputMode="numeric" defaultValue={valeur(propriete?.salles_de_bain)} />
        </label>
      </div>

      <label className="bo-check">
        <input type="checkbox" name="publie" defaultChecked={propriete?.publie ?? true} />
        Afficher sur le site
      </label>

      <div aria-live="polite">
        {state.error && (
          <p className="bo-error" role="alert">
            {state.error}
          </p>
        )}
      </div>
      <button className="bo-button" disabled={pending || preparation}>
        {pending ? "Enregistrement…" : "Enregistrer la propriété"}
      </button>
    </form>
  );
}
