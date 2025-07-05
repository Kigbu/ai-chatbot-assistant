// ```typescript
"use client";
import { useEffect, useState, useRef } from "react";
import toWav from "audiobuffer-to-wav";

export const useRecordVoice = () => {
  const [text, setText] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const isRecording = useRef(false);
  const chunks = useRef<Blob[]>([]);

  const startRecording = () => {
    if (mediaRecorder) {
      isRecording.current = true;
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      isRecording.current = false;
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const getText = async (audioBlob: Blob) => {
    try {
      // Convert WebM to WAV client-side
      const audioContext = new AudioContext();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const wavBuffer = toWav(audioBuffer, { sampleRate: 16000 });
      const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

      // Log WAV file for debugging
      const url = URL.createObjectURL(wavBlob);
      console.log("WAV file URL:", url);

      const formData = new FormData();
      formData.append("audio", wavBlob, "audio.wav");

      const response = await fetch("/api/speechToText", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();
      setText(result.text || "No transcription available");
    } catch (error: any) {
      console.error("Transcription error:", error.message);
      setText(`Transcription failed: ${error.message}`);
    }
  };

  const initialMediaRecorder = (stream: MediaStream) => {
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorder.onstart = () => {
      chunks.current = [];
    };
    mediaRecorder.ondataavailable = (ev) => {
      chunks.current.push(ev.data);
    };
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: "audio/webm" });
      getText(audioBlob);
    };
    setMediaRecorder(mediaRecorder);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initialMediaRecorder)
        .catch((err) => console.error("Microphone access error:", err));
    }
  }, []);

  return { recording, startRecording, stopRecording, text };
};