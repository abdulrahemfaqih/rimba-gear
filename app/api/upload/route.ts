import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { uploadToSupabaseStorage } from "@/lib/supabase";

async function uploadSingleBuffer(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  // 1. Prioritaskan Supabase Storage jika URL & KEY sudah diisi
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    try {
      const url = await uploadToSupabaseStorage(buffer, originalName, mimeType);
      return url;
    } catch (err) {
      console.warn("Supabase storage upload failed, falling back to secondary providers...", err);
    }
  }

  // 2. Fallback ke Cloudinary jika credentials tersedia
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const cleanFileName = path
      .basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 30);

    const secureUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "outdoor",
          public_id: `${Date.now()}-${cleanFileName || "image"}`,
          resource_type: "image",
          format: "webp",
          transformation: [
            { width: 1600, crop: "limit" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload failed"));
          } else {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return secureUrl;
  }

  // 3. Fallback ke local storage (/public/uploads)
  const ext = path.extname(originalName) || ".jpg";
  const cleanBase = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 20);
  const filename = `${Date.now()}-${cleanBase || "upload"}${ext}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, filename);
  await writeFile(filePath, buffer);

  return `/uploads/${filename}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = (
      formData.getAll("files").length > 0
        ? formData.getAll("files")
        : formData.getAll("file")
    ) as File[];

    if (!files || files.length === 0 || !(files[0] instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const url = await uploadSingleBuffer(buffer, file.name, file.type || "image/webp");
      uploadedUrls.push(url);
    }

    return NextResponse.json({
      url: uploadedUrls[0],
      urls: uploadedUrls,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
