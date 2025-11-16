// Azure TTS - with strict locking

import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { setActiveSynthesizer, unlockTTS, isPlayingTTS } from "./ttsManager";

const AZURE_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY;
const AZURE_REGION = import.meta.env.VITE_AZURE_REGION;

export const createSpeechSynthesizer = () => {
  if (!AZURE_KEY || !AZURE_REGION) {
    console.error("Azure credentials missing");
    return null;
  }

  try {
    const config = SpeechSDK.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
    config.speechSynthesisVoiceName = "en-US-AvaNeural";
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
    return new SpeechSDK.SpeechSynthesizer(config, audioConfig);
  } catch (error) {
    console.error("Error creating synthesizer:", error);
    return null;
  }
};

// NOTE: Lock should already be set BEFORE calling this function
export const speakText = (text, onEnd, onError) => {
  // Double-check lock (should already be set by caller)
  if (!isPlayingTTS()) {
    console.error("TTS not locked before speakText call");
    if (onError) onError(new Error("TTS not locked"));
    return null;
  }

  const synth = createSpeechSynthesizer();
  if (!synth) {
    unlockTTS();
    if (onError) onError(new Error("Synthesizer failed"));
    return null;
  }

  setActiveSynthesizer(synth);

  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="en-US-AvaNeural"><prosody rate="-10%">${escaped}</prosody></voice></speak>`;

  synth.speakSsmlAsync(
    ssml,
    () => {
      unlockTTS();
      try { synth.close(); } catch (e) {}
      if (onEnd) onEnd();
    },
    (err) => {
      unlockTTS();
      try { synth.close(); } catch (e) {}
      if (onError) onError(err);
    }
  );

  return synth;
};

export { isPlayingTTS };
export { stopActiveSynthesizer } from "./ttsManager";
