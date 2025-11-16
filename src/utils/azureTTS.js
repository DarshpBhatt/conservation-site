// Purpose: Azure TTS utility for consistent text-to-speech across the site

import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const AZURE_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY;
const AZURE_REGION = import.meta.env.VITE_AZURE_REGION;

// Debug logging
console.log("Azure TTS Config:", {
  hasKey: !!AZURE_KEY,
  hasRegion: !!AZURE_REGION,
  keyLength: AZURE_KEY?.length,
  region: AZURE_REGION
});

export const createSpeechSynthesizer = () => {
  if (!AZURE_KEY || !AZURE_REGION) {
    console.error("Azure Speech credentials not configured", {
      hasKey: !!AZURE_KEY,
      hasRegion: !!AZURE_REGION
    });
    return null;
  }

  if (!SpeechSDK || !SpeechSDK.SpeechConfig) {
    console.error("Azure Speech SDK not loaded", { SpeechSDK: !!SpeechSDK });
    return null;
  }

  try {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      AZURE_KEY,
      AZURE_REGION
    );
    speechConfig.speechSynthesisVoiceName = "en-US-AvaNeural"; // calm, soft tone
    speechConfig.speechSynthesisOutputFormat =
      SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    // Slower speech
    speechConfig.setProperty(
      SpeechSDK.PropertyId.SpeechServiceResponse_RequestSentenceBoundary,
      "true"
    );
    speechConfig.setProperty(
      SpeechSDK.PropertyId.SpeechServiceResponse_SynthesisVoiceRate,
      "-10%"
    );

    // Create audio config for browser playback
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
    
    const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
    console.log("Speech synthesizer created successfully");
    return synthesizer;
  } catch (error) {
    console.error("Error creating speech synthesizer:", error);
    return null;
  }
};

export const speakText = (text, onEnd, onError) => {
  console.log("speakText called with:", { textLength: text?.length, hasText: !!text });
  
  if (!text || text.trim().length === 0) {
    console.warn("Empty text provided to speakText");
    if (onError) onError(new Error("Empty text"));
    return null;
  }

  const synth = createSpeechSynthesizer();
  if (!synth) {
    console.error("Failed to create speech synthesizer");
    if (onError) onError(new Error("Speech synthesizer not available"));
    return null;
  }

  console.log("Starting speech synthesis...");
  
  synth.speakTextAsync(
    text,
    (result) => {
      console.log("Speech synthesis completed", result);
      if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        console.log("Speech synthesized successfully");
      } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
        const cancellation = SpeechSDK.CancellationDetails.fromResult(result);
        console.error("Speech synthesis canceled:", cancellation.reason, cancellation.errorDetails);
      }
      synth.close();
      if (onEnd) onEnd();
    },
    (err) => {
      console.error("Speech synthesis error:", err);
      synth.close();
      if (onError) onError(err);
    }
  );

  return synth;
};

export const stopSpeech = (synth) => {
  if (synth) {
    try {
      synth.stopSpeakingAsync(
        () => {
          synth.close();
        },
        (err) => {
          console.warn("Error stopping speech:", err);
          synth.close();
        }
      );
    } catch (error) {
      console.error("Error stopping speech:", error);
      synth.close();
    }
  }
};

