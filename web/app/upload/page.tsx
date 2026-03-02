"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Step = "idle" | "presign" | "upload" | "register" | "captions" | "done" | "error";

const ACCEPTED = "image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic";

const STEPS: Step[] = ["presign", "upload", "register", "captions"];

const STEP_LABELS: Record<Step, string> = {
  idle: "",
  presign: "Getting upload URL...",
  upload: "Uploading image...",
  register: "Registering image...",
  captions: "Generating captions...",
  done: "Done!",
  error: "",
};

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setError(null);
    setStep("idle");
    setCaptions([]);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }

  async function handleUpload() {
    if (!file) return;
    setError(null);
    setCaptions([]);

    try {
      // Get JWT access token from the active Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setError("You must be logged in to upload. Please sign in first.");
        return;
      }

      const authHeaders = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Step 1: Get presigned S3 URL
      setStep("presign");
      const presignRes = await fetch(
        "https://api.almostcrackd.ai/pipeline/generate-presigned-url",
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ contentType: file.type }),
        }
      );
      if (!presignRes.ok) {
        const j = await presignRes.json().catch(() => ({}));
        throw new Error(j?.message ?? `Presign failed (${presignRes.status})`);
      }
      const { presignedUrl, cdnUrl } = await presignRes.json();

      // Step 2: Upload image bytes directly to S3 (no auth header here)
      setStep("upload");
      const s3Res = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!s3Res.ok) throw new Error(`S3 upload failed (${s3Res.status})`);

      // Step 3: Register the CDN URL in the pipeline
      setStep("register");
      const registerRes = await fetch(
        "https://api.almostcrackd.ai/pipeline/upload-image-from-url",
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
        }
      );
      if (!registerRes.ok) {
        const j = await registerRes.json().catch(() => ({}));
        throw new Error(j?.message ?? `Register failed (${registerRes.status})`);
      }
      const { imageId } = await registerRes.json();

      // Step 4: Generate captions
      setStep("captions");
      const captionRes = await fetch(
        "https://api.almostcrackd.ai/pipeline/generate-captions",
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ imageId }),
        }
      );
      if (!captionRes.ok) {
        const j = await captionRes.json().catch(() => ({}));
        throw new Error(j?.message ?? `Caption generation failed (${captionRes.status})`);
      }

      const captionData = await captionRes.json();
      const generated: string[] = Array.isArray(captionData)
        ? captionData.map((c: any) => c?.content ?? c?.caption ?? String(c)).filter(Boolean)
        : [];

      setCaptions(generated);
      setStep("done");

    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setStep("error");
    }
  }

  const isLoading = STEPS.includes(step as any);
  const currentStepIndex = STEPS.indexOf(step as any);

  return (
    <main style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>

      {/* Page title — matches your other pages exactly */}
      <div
        style={{
          fontSize: 56,
          lineHeight: 1.05,
          letterSpacing: -1,
          marginBottom: 12,
        }}
      >
        Upload
      </div>

      <p style={{ marginTop: 0, marginBottom: 24, opacity: 0.7, fontSize: 16 }}>
        Upload an image to generate captions.
      </p>

      {/* Main card — matches protected/page.tsx card style */}
      <div
        style={{
          width: "min(640px, 100%)",
          padding: "26px 22px",
          borderRadius: 22,
          background: "rgba(15,15,15,0.55)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.65)",
        }}
      >
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
          }}
          style={{
            border: "2px dashed rgba(255,255,255,0.14)",
            borderRadius: 14,
            padding: preview ? 0 : "36px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: "rgba(255,255,255,0.02)",
            overflow: "hidden",
            transition: "border-color 160ms ease, background 160ms ease",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: 340,
                objectFit: "contain",
                display: "block",
              }}
            />
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🖼️</div>
              <div style={{ opacity: 0.6, fontSize: 14 }}>
                Click to choose an image
              </div>
              <div style={{ opacity: 0.4, fontSize: 12, marginTop: 6 }}>
                JPEG · PNG · WebP · GIF · HEIC
              </div>
            </>
          )}
        </div>

        {file && (
          <div style={{ marginTop: 10, opacity: 0.55, fontSize: 13 }}>
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* Generate button — matches "Begin Voting" button in protected/page.tsx */}
        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          style={{
            marginTop: 18,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.16)",
            color: "white",
            fontWeight: 600,
            fontSize: 15,
            cursor: !file || isLoading ? "not-allowed" : "pointer",
            opacity: !file || isLoading ? 0.5 : 1,
            width: "100%",
            transition: "all 160ms ease",
          }}
          onMouseEnter={(e) => {
            if (!file || isLoading) return;
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.10)";
          }}
        >
          {isLoading ? STEP_LABELS[step] : "Generate Captions"}
        </button>

        {/* Progress bar */}
        {isLoading && (
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {STEPS.map((s, i) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 999,
                  background:
                    currentStepIndex >= i
                      ? "rgba(255,255,255,0.75)"
                      : "rgba(255,255,255,0.12)",
                  transition: "background 300ms ease",
                }}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(255,80,80,0.10)",
              border: "1px solid rgba(255,80,80,0.22)",
              color: "tomato",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Generated captions — same card style as the rest of the site */}
      {step === "done" && captions.length > 0 && (
        <div style={{ marginTop: 28, width: "min(640px, 100%)" }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Generated Captions
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {captions.map((caption, i) => (
              <div
                key={i}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(6px)",
                  fontSize: 16,
                  lineHeight: 1.4,
                }}
              >
                {caption}
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push("/captions")}
            style={{
              marginTop: 16,
              padding: "10px 18px",
              borderRadius: 999,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            View all captions →
          </button>
        </div>
      )}

      {step === "done" && captions.length === 0 && (
        <div style={{ marginTop: 20, opacity: 0.7, fontSize: 15 }}>
          Upload complete! Captions are being processed.{" "}
          <span
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => router.push("/captions")}
          >
            View captions →
          </span>
        </div>
      )}
    </main>
  );
}