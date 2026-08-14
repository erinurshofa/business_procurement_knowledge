import { NextRequest, NextResponse } from "next/server";
import { extractDocumentMetadata } from "@/lib/ocrEngine";

export async function POST(req: NextRequest) {
  try {
    let fileName = "Dokumen_SPK_Baru.pdf";
    let rawText = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file) {
        fileName = file.name;
        // In node environment, we can extract basic text or simulated OCR payload
        rawText = `Simulated OCR buffer for file ${file.name} (size: ${file.size} bytes)`;
      }
    } else {
      const body = await req.json();
      fileName = body.fileName || fileName;
      rawText = body.rawText || rawText;
    }

    // Run OCR Extraction Engine
    const ocrResult = extractDocumentMetadata(fileName, rawText);

    return NextResponse.json({
      success: true,
      message: `Ekstraksi OCR berhasil untuk dokumen ${fileName}`,
      data: ocrResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal memproses ekstraksi OCR dokumen", details: error?.message },
      { status: 500 }
    );
  }
}
