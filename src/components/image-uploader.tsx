"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useState } from "react";

export function ImageUploader({
  folder,
  name = "images",
  initial = [],
  max = 6,
}: {
  folder: "products" | "commissions";
  name?: string;
  initial?: string[];
  max?: number;
}) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const picked = Array.from(files).slice(0, max - urls.length);
      const uploaded = await Promise.all(
        picked.map((file) =>
          upload(`${folder}/${file.name.replace(/[^\w.-]/g, "_")}`, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
          }),
        ),
      );
      setUrls((prev) => [...prev, ...uploaded.map((u) => u.url)]);
    } catch (e) {
      setError((e as Error).message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {urls.map((u) => (
        <input key={u} type="hidden" name={name} value={u} />
      ))}
      {urls.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {urls.map((u, i) => (
            <li key={u} className="relative h-24 w-20 overflow-hidden rounded border border-sand">
              <Image src={u} alt="" fill sizes="80px" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/60 px-1 text-xs text-cream">
                {folder === "products" && i > 0 ? (
                  <button type="button" onClick={() => setUrls((p) => [u, ...p.filter((x) => x !== u)])}>
                    Main
                  </button>
                ) : (
                  <span>{folder === "products" ? "Main" : ""}</span>
                )}
                <button type="button" aria-label="Remove image" onClick={() => setUrls((p) => p.filter((x) => x !== u))}>
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {urls.length < max && (
        <label className="inline-block cursor-pointer rounded border border-dashed border-olive px-4 py-2 text-sm text-olive">
          {busy ? "Uploading…" : "Add photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
