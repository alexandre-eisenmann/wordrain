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
        const soundId = hitSound.play();
        console.log("Hit sound played with ID:", soundId);
      } catch (error) {
        console.error("Hit sound play failed:", error);
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
        const soundId = successSound.play();
        console.log("Success sound played with ID:", soundId);
      } catch (error) {
        console.error("Success sound play failed:", error);
      }
    } else if (isMuted) {
      console.log("Success sound skipped (muted)");
    } else {
      console.log("Success sound not available");
    }
  }
}));
