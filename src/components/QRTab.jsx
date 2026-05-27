import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "./ui";

export default function QRTab({ menuUrl, data }) {
  const qrRef = useRef(null);
  const qrData = `${menuUrl}?view=menu`;

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "menu-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <section>
      <section className="qr-section">
        {/* ── General menu QR ── */}
        <article className="qr-card">
          <div className="qr-canvas" ref={qrRef}>
            <QRCodeCanvas
              value={qrData}
              size={200}
              bgColor="#ffffff"
              fgColor="#1a1a1a"
              level="M"
            />
          </div>
          <p className="qr-label">General Menu QR</p>
          <p className="qr-url">{qrData}</p>
          <Button
            variant="primary"
            onClick={downloadQR}
            style={{ marginTop: "1rem", width: "100%" }}
          >
            Download PNG
          </Button>
        </article>

        {/* ── How it works + stats ── */}
        <aside className="qr-instructions">
          <p className="instructions-title">How it works</p>
          <ol className="instruction-list">
            {[
              [
                "1",
                "Print & place",
                "Display at tables, counter, or on packaging. No app download needed.",
              ],
              [
                "2",
                "Guests scan",
                "Any smartphone camera opens the digital menu instantly.",
              ],
              [
                "3",
                "Live updates",
                "Add or remove items below — changes appear immediately when scanned.",
              ],
            ].map(([n, title, desc]) => (
              <li key={n} className="instruction-step">
                <span className="step-number" aria-hidden="true">
                  {n}
                </span>
                <div className="step-content">
                  <p>{title}</p>
                  <p>{desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="stats-row">
            {[
              ["Total items", data.items.length],
              ["Available", data.items.filter((i) => i.available).length],
              ["Categories", data.categories.length],
            ].map(([label, val]) => (
              <div key={label} className="stat-box">
                <p className="stat-value">{val}</p>
                <p className="stat-label">{label}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </section>
  );
}
