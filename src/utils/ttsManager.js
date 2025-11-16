// Global TTS lock - prevents multiple instances

let isLocked = false;
let activeSynthesizer = null;

// Lock IMMEDIATELY - called before any async operations
export const lockTTS = () => {
  if (isLocked) {
    return false; // Already locked
  }
  isLocked = true;
  return true; // Successfully locked
};

export const unlockTTS = () => {
  isLocked = false;
  activeSynthesizer = null;
};

export const isPlayingTTS = () => {
  return isLocked;
};

export const setActiveSynthesizer = (synth) => {
  if (activeSynthesizer) {
    const prev = activeSynthesizer;
    try {
      prev.stopSpeakingAsync(
        () => { try { prev.close(); } catch (e) {} },
        () => { try { prev.close(); } catch (e) {} }
      );
    } catch (e) {
      try { prev.close(); } catch (err) {}
    }
  }
  activeSynthesizer = synth;
};

export const stopActiveSynthesizer = () => {
  const synth = activeSynthesizer;
  isLocked = false;
  activeSynthesizer = null;
  
  if (synth) {
    try {
      synth.stopSpeakingAsync(
        () => { try { synth.close(); } catch (e) {} },
        () => { try { synth.close(); } catch (e) {} }
      );
    } catch (e) {
      try { synth.close(); } catch (err) {}
    }
  }
};
