import { create } from "zustand";
import { Howl, Howler } from "howler";

interface AudioState {
  hitSound: Howl | null;
  successSound: Howl | null;
  isMuted: boolean;
  
  // Setter functions
  setHitSound: (sound: Howl) => void;
  setSuccessSound: (sound: Howl) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  hitSound: null,
  successSound: null,
  isMuted: false, // Start with sound on by default
  
  setHitSound: (sound) => {
    console.log("Setting hit sound");
    set({ hitSound: sound });
  },
  setSuccessSound: (sound) => {
    console.log("Setting success sound");
    set({ successSound: sound });
  },
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Update Howler global mute state
    Howler.mute(newMutedState);
    
    // Update local state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    console.log("Attempting to play hit sound", { hitSound: !!hitSound, isMuted });
    
    if (hitSound && !isMuted) {
      try {
        // Ensure audio context is resumed for mobile
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume().then(() => {
            const soundId = hitSound.play();
            console.log("Hit sound played with ID:", soundId);
          }).catch((error) => {
            console.error("Failed to resume audio context for hit sound:", error);
          });
        } else {
          const soundId = hitSound.play();
          console.log("Hit sound played with ID:", soundId);
        }
      } catch (error) {
        console.error("Hit sound play failed:", error);
        // Try to resume audio context and retry
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume().then(() => {
            try {
              const soundId = hitSound.play();
              console.log("Hit sound played with ID (retry):", soundId);
            } catch (retryError) {
              console.error("Hit sound retry failed:", retryError);
            }
          });
        }
      }
    } else if (isMuted) {
      console.log("Hit sound skipped (muted)");
    } else {
      console.log("Hit sound not available");
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    console.log("Attempting to play success sound", { successSound: !!successSound, isMuted });
    
    if (successSound && !isMuted) {
      try {
        // Ensure audio context is resumed for mobile
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume().then(() => {
            const soundId = successSound.play();
            console.log("Success sound played with ID:", soundId);
          }).catch((error) => {
            console.error("Failed to resume audio context for success sound:", error);
          });
        } else {
          const soundId = successSound.play();
          console.log("Success sound played with ID:", soundId);
        }
      } catch (error) {
        console.error("Success sound play failed:", error);
        // Try to resume audio context and retry
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume().then(() => {
            try {
              const soundId = successSound.play();
              console.log("Success sound played with ID (retry):", soundId);
            } catch (retryError) {
              console.error("Success sound retry failed:", retryError);
            }
          });
        }
      }
    } else if (isMuted) {
      console.log("Success sound skipped (muted)");
    } else {
      console.log("Success sound not available");
    }
  }
}));
