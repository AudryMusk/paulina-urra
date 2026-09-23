import { randomBytes } from "node:crypto";
import { provisionUser } from "../src/lib/backoffice/identity";

const [courriel, nom] = process.argv.slice(2);
if (!courriel || !nom) {
  console.error("Utilisation : npm run compte:creer -- <courriel> <Paulina|Denis>");
  process.exit(1);
}

const motDePasse = randomBytes(18).toString("base64url");
const compte = await provisionUser(courriel, nom, motDePasse);
console.log(`Compte prêt pour ${compte.name} (${compte.email}).`);
console.log(`Mot de passe : ${motDePasse}`);
console.log("Transmettez-le de façon sécuritaire : il ne sera plus jamais affiché.");
