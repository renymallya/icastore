import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

// Issues short-lived tokens so the browser uploads straight to Vercel Blob,
// avoiding the 4.5 MB request limit on Vercel functions.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (pathname.startsWith("products/")) {
          if (!(await isAdmin())) throw new Error("Not authorised");
          return { allowedContentTypes: IMAGE_TYPES, maximumSizeInBytes: 15 * 1024 * 1024, addRandomSuffix: true };
        }
        if (pathname.startsWith("commissions/")) {
          return { allowedContentTypes: IMAGE_TYPES, maximumSizeInBytes: 8 * 1024 * 1024, addRandomSuffix: true };
        }
        throw new Error("Invalid upload path");
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
