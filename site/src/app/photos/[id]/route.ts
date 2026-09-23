import { lirePhoto } from "@/lib/backoffice/proprietes";

export async function GET(_requete: Request, ctx: RouteContext<"/photos/[id]">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Photo introuvable.", { status: 404 });
  const photo = await lirePhoto(id);
  if (!photo) return new Response("Photo introuvable.", { status: 404 });
  return new Response(new Uint8Array(photo.octets), {
    headers: {
      "Content-Type": photo.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
