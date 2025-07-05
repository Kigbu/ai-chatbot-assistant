// ```typescript
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check API key
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error("HUGGINGFACE_API_KEY is not set");
      return NextResponse.json({ error: "Server configuration error: Missing API key" }, { status: 500 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    if (!audioFile) {
      console.error("No audio file received in formData");
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    console.log("Audio buffer size:", audioBuffer.length);

    const modelEndpoint = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";
    const response = await fetch(modelEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "audio/wav",
      },
      body: audioBuffer,
    });

    console.log("Hugging Face API response status:", response.status);
    console.log("Hugging Face API response headers:", Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (result.error) {
      console.error("Hugging Face API result error:", result.error);
      throw new Error(result.error);
    }

    return NextResponse.json({ text: result.text || "No transcription available" });
  } catch (error: any) {
    console.error("API route error:", error.message, error.stack);
    return NextResponse.json({ error: `Transcription failed: ${error.message}` }, { status: 500 });
  }
}