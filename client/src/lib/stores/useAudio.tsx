import { create } from "zustand";
import { Howl, Howler } from "howler";

interface AudioState {
  hitSound: Howl | null;
  successSound: Howl | null;
  isMuted: boolean;
  audioContextActive: boolean;
  lastHitPlayTime: number;
  
  // Setter functions
  setHitSound: (sound: Howl) => void;
  setSuccessSound: (sound: Howl) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  ensureAudioContext: () => Promise<void>;
}

export const useAudio = create<AudioState>((set, get) => ({
  hitSound: null,
  successSound: null,
  isMuted: false, // Start with sound on by default
  audioContextActive: false,
  lastHitPlayTime: 0,
  
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

  ensureAudioContext: async () => {
    try {
      // Resume Howler audio context if suspended
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        await Howler.ctx.resume();
        console.log("Audio context resumed");
        set({ audioContextActive: true });
      } else if (Howler.ctx && Howler.ctx.state === 'running') {
        set({ audioContextActive: true });
      }
      
      // Ensure Howler is not muted
      Howler.mute(false);
    } catch (error) {
      console.error("Failed to ensure audio context:", error);
      set({ audioContextActive: false });
    }
  },
  
  playHit: async () => {
    const { hitSound, isMuted, audioContextActive, lastHitPlayTime } = get();
    const now = Date.now();
    
    // Debounce rapid hits to prevent audio context issues
    if (now - lastHitPlayTime < 50) { // Minimum 50ms between hits
      console.log("Hit sound debounced (too rapid)");
      return;
    }
    
    console.log("Attempting to play hit sound", { hitSound: !!hitSound, isMuted, audioContextActive });
    
    if (!hitSound || isMuted) {
      console.log(hitSound ? "Hit sound skipped (muted)" : "Hit sound not available");
      return;
    }

    try {
      // Update last play time
      set({ lastHitPlayTime: now });
      
      // Ensure audio context is active
      await get().ensureAudioContext();
      
      // Check if the sound is in a valid state
      if (hitSound.state() === 'unloaded') {
        console.log("Hit sound was unloaded, reloading...");
        hitSound.load();
        // Wait a bit for the sound to load
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Try to play the sound
      const soundId = hitSound.play();
      console.log("Hit sound played with ID:", soundId);
      
      // If the sound ID is null or undefined, it means the sound failed to play
      if (!soundId) {
        console.warn("Hit sound play returned null/undefined ID, attempting recovery...");
        
        // Try to reload the sound and play again
        hitSound.unload();
        hitSound.load();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const retryId = hitSound.play();
        console.log("Hit sound retry played with ID:", retryId);
      }
      
    } catch (error) {
      console.error("Hit sound play failed:", error);
      
      // Try to recover by recreating the sound
      try {
        console.log("Attempting to recreate hit sound...");
        const newHitSound = new Howl({
          src: ["/wordrain/sounds/hit.mp3"],
          volume: 0.5,
          preload: true,
          html5: true,
        });
        
        set({ hitSound: newHitSound });
        
        // Wait for the new sound to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const recoveryId = newHitSound.play();
        console.log("Hit sound recovery played with ID:", recoveryId);
      } catch (recoveryError) {
        console.error("Hit sound recovery failed:", recoveryError);
      }
    }
  },
  
  playSuccess: async () => {
    const { successSound, isMuted } = get();
    console.log("Attempting to play success sound", { successSound: !!successSound, isMuted });
    
    if (!successSound || isMuted) {
      console.log(successSound ? "Success sound skipped (muted)" : "Success sound not available");
      return;
    }

    try {
      // Ensure audio context is active
      await get().ensureAudioContext();
      
      // Check if the sound is in a valid state
      if (successSound.state() === 'unloaded') {
        console.log("Success sound was unloaded, reloading...");
        successSound.load();
        // Wait a bit for the sound to load
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Try to play the sound
      const soundId = successSound.play();
      console.log("Success sound played with ID:", soundId);
      
      // If the sound ID is null or undefined, it means the sound failed to play
      if (!soundId) {
        console.warn("Success sound play returned null/undefined ID, attempting recovery...");
        
        // Try to reload the sound and play again
        successSound.unload();
        successSound.load();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const retryId = successSound.play();
        console.log("Success sound retry played with ID:", retryId);
      }
      
    } catch (error) {
      console.error("Success sound play failed:", error);
      
      // Try to recover by recreating the sound
      try {
        console.log("Attempting to recreate success sound...");
        const newSuccessSound = new Howl({
          src: ["/wordrain/sounds/success.mp3"],
          volume: 0.7,
          preload: true,
          html5: true,
        });
        
        set({ successSound: newSuccessSound });
        
        // Wait for the new sound to load
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const recoveryId = newSuccessSound.play();
        console.log("Success sound recovery played with ID:", recoveryId);
      } catch (recoveryError) {
        console.error("Success sound recovery failed:", recoveryError);
      }
    }
  }
}));
