/** Redimensionne et compresse une photo dans le navigateur (JPEG, 1600 px max). */
export const TAILLE_MAX_OCTETS = 4 * 1024 * 1024;
const COTE_MAX = 1600;

export async function compresserImage(fichier: File): Promise<Blob> {
  if (!fichier.type.startsWith("image/")) {
    throw new Error("Ce fichier n'est pas une image.");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(fichier, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Image illisible. Essayez une photo JPEG ou PNG.");
  }
  const echelle = Math.min(1, COTE_MAX / Math.max(bitmap.width, bitmap.height));
  const largeur = Math.round(bitmap.width * echelle);
  const hauteur = Math.round(bitmap.height * echelle);
  const canvas = document.createElement("canvas");
  canvas.width = largeur;
  canvas.height = hauteur;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Compression impossible sur cet appareil.");
  ctx.drawImage(bitmap, 0, 0, largeur, hauteur);
  bitmap.close();

  for (const qualite of [0.82, 0.7, 0.55]) {
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", qualite));
    if (blob && blob.size <= TAILLE_MAX_OCTETS) return blob;
  }
  throw new Error("Image trop lourde, même compressée (4 Mo maximum).");
}
