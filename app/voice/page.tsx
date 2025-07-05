"use client";
import { useRecordVoice } from '@/hooks/useRecordVoice';
import React from 'react';

export default function Voice() {
  const { recording, startRecording, stopRecording, text } = useRecordVoice();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Speech to Text</h1>
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded ${recording ? "bg-red-500" : "bg-green-500"} text-white`}
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      <p className="mt-4">Transcription: {text}</p>
    </div>
  );
}
