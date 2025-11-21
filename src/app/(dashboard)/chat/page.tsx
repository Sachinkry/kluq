"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PDFUpload from "@/components/pdf-upload";

export default function ChatLandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePDFSelect(file: File) {
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/pdf/upload", {
        method: "POST",
        body: form,
      });

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload PDF");
      }

      if (data.pdfId) {
        router.push(`/chat/${data.pdfId}`);
      } else {
        throw new Error("No PDF ID returned from server");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload PDF. Please try again.");
      setLoading(false);
    }
  }

  return <PDFUpload onPDFSelect={handlePDFSelect} loading={loading} />;
}
