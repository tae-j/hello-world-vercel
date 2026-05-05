export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 900 }}>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(46px, 6vw, 86px)",
            letterSpacing: 2,
            textShadow:
              "0 0 18px rgba(255,255,255,0.20), 0 0 44px rgba(255,255,255,0.10)",
          }}
        >
          Hello You
        </h1>
        <p
          style={{
            marginTop: 20,
            fontSize: "clamp(15px, 1.6vw, 18px)",
            opacity: 0.7,
            lineHeight: 1.6,
            letterSpacing: 0.2,
          }}
        >
          Welcome to your daily dose of AI-generated memes.
          <br />
          Upload, generate, and rate captions whenever you please.
        </p>
      </div>
    </main>
  );
}


