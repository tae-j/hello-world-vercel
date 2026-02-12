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
          Hello World
        </h1>
      </div>
    </main>
  );
}


