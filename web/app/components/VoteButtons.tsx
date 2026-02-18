"use client";

type VoteButtonsProps = {
  disabled?: boolean;
  onDown: () => void;
  onUp: () => void;
};

const btn = (disabled: boolean): React.CSSProperties => ({
  width: 72,              // ✅ bigger
  height: 72,
  borderRadius: 9999,
  border: "2px solid rgba(255,255,255,0.28)", // ✅ visible circle border
  background: "rgba(0,0,0,0.15)",             // subtle glassy fill
  color: "white",
  fontSize: 28,           // ✅ bigger emoji
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.55 : 1,
  transition: "transform 120ms ease, background 120ms ease, border 120ms ease",
  userSelect: "none",
});

export default function VoteButtons({ disabled = false, onDown, onUp }: VoteButtonsProps) {
  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.style.transform = "translateY(-1px)";
    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
    e.currentTarget.style.border = "2px solid rgba(255,255,255,0.40)";
  };

  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    Object.assign(e.currentTarget.style, btn(disabled));
  };

  return (

    

    <div
      style={{
        position: "fixed",
        right: 48,        // ✅ right side of screen
        top: 120,         // ✅ near the top; adjust if you want lower/higher
        zIndex: 50,
        display: "flex",
        gap: 16,
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <button
        type="button"
        onClick={onDown}
        disabled={disabled}
        aria-label="Thumbs down"
        style={btn(disabled)}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        👎
      </button>

      <button
        type="button"
        onClick={onUp}
        disabled={disabled}
        aria-label="Thumbs up"
        style={btn(disabled)}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        👍
      </button>
    </div>
  );
}




