import { createClient } from "./client"

const MAX_IMAGE_DIMENSION = 1600
const BUCKET = "product-media"

// Downscales large photos client-side before upload so the bucket doesn't
// fill up with multi-megabyte camera originals — product photos never need
// to render larger than this on the site.
async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height))
  if (scale === 1) return file

  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext("2d")
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), file.type === "image/png" ? "image/png" : "image/jpeg", 0.85)
  })
}

export async function uploadProductMedia(file: File, kind: "image" | "video"): Promise<string> {
  const supabase = createClient()
  const body = kind === "image" ? await resizeImage(file) : file
  const ext = file.name.split(".").pop() || (kind === "image" ? "jpg" : "mp4")
  const path = `products/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    cacheControl: "31536000",
    contentType: file.type || undefined,
    upsert: false,
  })
  if (error) throw new Error(error.message)

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
