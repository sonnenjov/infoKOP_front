import { useState } from "react"

const SERVICES = [
  { name: "OpenWeather API",       sub: "Current mountain conditions & forecasts",  icon: "cloud",          connected: true  },
  { name: "Stripe Payment Gateway", sub: "Transaction processing & partner payouts", icon: "credit_card",    connected: true  },
  { name: "Google Maps Platform",  sub: "Geocoding & dynamic resort maps",           icon: "location_on",    connected: false },
]

export default function AdminAPI() {
  const [services, setServices] = useState(SERVICES)
  const [keys, setKeys] = useState(["pk_live_51M...K92z"])
  const [copied, setCopied] = useState<number | null>(null)

  const toggleService = (i: number) =>
    setServices((p) => p.map((s, idx) => idx === i ? { ...s, connected: !s.connected } : s))

  const copyKey = (i: number, key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(i)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="main_general">

      <div style={{ width: "100%" }}>
        <p className="setting_title" style={{ marginBottom: "0.8em" }}>Connected Services</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
          {services.map((s, i) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "1em", background: "#1e1e1e", borderRadius: 12, padding: "0.9em 1em" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#76b817" }}>{s.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 0.15em", fontSize: "0.88em", fontWeight: 600 }}>{s.name}</p>
                <p style={{ margin: 0, fontSize: "0.72em", color: "#666" }}>{s.sub}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8em" }}>
                {s.connected
                  ? <>
                      <span style={{ fontSize: "0.75em", color: "#76b817", display: "flex", alignItems: "center", gap: "0.3em" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#76b817", display: "inline-block" }} />
                        Active
                      </span>
                      <button className="ghost_btn" onClick={() => toggleService(i)}>Manage</button>
                    </>
                  : <>
                      <span style={{ fontSize: "0.75em", color: "#666" }}>Disconnected</span>
                      <button onClick={() => toggleService(i)} style={{ background: "#76b817", color: "#1a2e22", border: "none", borderRadius: 8, padding: "0.4em 1em", cursor: "pointer", fontSize: "0.8em", fontWeight: 700 }}>Connect</button>
                    </>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="divider" />

      <div style={{ width: "100%" }}>
        <div className="setting_row" style={{ marginBottom: "0.8em" }}>
          <p className="setting_title">Developer API Keys</p>
          <button className="ghost_btn" onClick={() => setKeys((p) => [...p, "pk_live_new...key"])}>+ New Key</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
          {keys.map((key, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1e1e1e", border: "1px dashed #333", borderRadius: 10, padding: "0.75em 1em" }}>
              <span style={{ fontFamily: "monospace", fontSize: "0.85em", color: "#aaa" }}>{key}</span>
              <button onClick={() => copyKey(i, key)} style={{ background: "none", border: "none", cursor: "pointer", color: copied === i ? "#76b817" : "#555", display: "flex", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{copied === i ? "check" : "content_copy"}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}