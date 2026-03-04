import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

let globalAudio: HTMLAudioElement | null = null;

const getAudio = () => {
  if (!globalAudio) {
    globalAudio = new Audio("/audio/jazz-bg.mp3");
    globalAudio.loop = true;
    globalAudio.volume = 0.3;
  }
  return globalAudio;
};

const MusicPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    const audio = getAudio();
    if (!audio.paused) {
      setPlaying(true);
      hasAutoPlayed.current = true;
      return;
    }

    const tryAutoPlay = () => {
      if (hasAutoPlayed.current) return;
      audio.play().then(() => {
        hasAutoPlayed.current = true;
        setPlaying(true);
        cleanup();
      }).catch(() => {});
    };

    const cleanup = () => {
      document.removeEventListener("click", tryAutoPlay, true);
      document.removeEventListener("scroll", tryAutoPlay, true);
      document.removeEventListener("touchstart", tryAutoPlay, true);
    };

    tryAutoPlay();
    document.addEventListener("click", tryAutoPlay, true);
    document.addEventListener("scroll", tryAutoPlay, true);
    document.addEventListener("touchstart", tryAutoPlay, true);

    return () => cleanup();
  }, []);

  const toggle = () => {
    const audio = getAudio();
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center transition-all duration-300"
      style={{
        background: "rgba(13,17,14,0.85)",
        border: "1px solid rgba(201,168,76,0.3)",
        backdropFilter: "blur(8px)",
        color: playing ? "#C9A84C" : "rgba(201,168,76,0.4)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.6)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; }}
      aria-label={playing ? "Mute music" : "Play music"}
    >
      {playing ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </button>
  );
};

export default MusicPlayer;
