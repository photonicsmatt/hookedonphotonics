import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

// Client-side uploads go straight to Vercel Blob via a short-lived token issued here.
// Requires BLOB_READ_WRITE_TOKEN in env (set automatically on Vercel).
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Uploads not configured. Set BLOB_READ_WRITE_TOKEN (Vercel Blob), or paste an image URL instead.",
      },
      { status: 501 }
    );
  }

  const body = (await req.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        maximumSizeInBytes: 8 * 1024 * 1024,
        tokenPayload: JSON.stringify({ userId: user.id, pathname }),
      }),
      onUploadCompleted: async () => {
        // Hook: could log to an audit table here.
      },
    });
    return NextResponse.json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "upload failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
