import sharp from "sharp";

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Mengoptimalkan buffer gambar:
 * - Mengubah format ke WebP
 * - Auto-rotate sesuai orientasi kamera HP (EXIF)
 * - Resize jika melebihi maxWidth/maxHeight (default: max 1600px, fit inside, tanpa pembesaran jika foto kecil)
 * - Kompresi kualitas tinggi (default: 82%, tetap jernih dan tajam, ukuran file turun hingga 80-90%)
 */
export async function optimizeImageToWebp(
  buffer: Buffer,
  options: OptimizeOptions = {}
): Promise<{ buffer: Buffer; contentType: string; extension: string }> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 82 } = options;

  try {
    const pipeline = sharp(buffer, { failOn: "none" })
      .rotate() // Menangani orientasi EXIF dari foto HP vertikal/horizontal
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality,
        effort: 4,
        smartSubsample: true,
      });

    const optimizedBuffer = await pipeline.toBuffer();

    return {
      buffer: optimizedBuffer,
      contentType: "image/webp",
      extension: "webp",
    };
  } catch (error) {
    console.warn("⚠️ Warning: Gagal mengoptimasi gambar dengan Sharp, menggunakan buffer asli:", error);
    return {
      buffer,
      contentType: "image/webp",
      extension: "webp",
    };
  }
}
