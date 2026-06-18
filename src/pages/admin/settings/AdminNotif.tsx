import { useState } from "react"

const EVENTS = ["System Critical Alerts", "New Partner Approval", "Booking Confirmations", "Marketing Communications"]
const CHANNELS = ["EMAIL", "SMS", "PUSH"] as const
type Channel = typeof CHANNELS[number]
type State = Record<string, Record<Channel, boolean>>

const DEFAULT: State = {
  "System Critical Alerts":   { EMAIL: true,  SMS: true,  PUSH: true  },
  "New Partner Approval":     { EMAIL: true,  SMS: false, PUSH: true  },
  "Booking Confirmations":    { EMAIL: true,  SMS: false, PUSH: false },
  "Marketing Communications": { EMAIL: false, SMS: false, PUSH: false },
}

export default function AdminNotif() {
  const [state, setState] = useState<State>(DEFAULT)
  const [digest, setDigest] = useState("Daily Summary")

  const toggle = (event: string, ch: Channel) =>
    setState((p) => ({ ...p, [event]: { ...p[event], [ch]: !p[event][ch] } }))

  return (
    <div className="main_general">

      <div style={{ width: "100%", background: "#121212", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 80px)", padding: "0.6em 1em", borderBottom: "1px solid #333" }}>
          <span style={{ fontSize: "0.72em", color: "#555", letterSpacing: "0.08em" }}>EVENT TYPE</span>
          {CHANNELS.map((ch) => (
            <span key={ch} style={{ fontSize: "0.72em", color: "#555", letterSpacing: "0.08em", textAlign: "center" }}>{ch}</span>
          ))}
        </div>

        {EVENTS.map((ev, i) => (
          <div key={ev} style={{
            display: "grid", gridTemplateColumns: "1fr repeat(3, 80px)",
            padding: "0.85em 1em", alignItems: "center",
            borderBottom: i < EVENTS.length - 1 ? "1px solid #1e1e1e" : "none",
          }}>
            <span style={{ fontSize: "0.88em", color: "#ddd" }}>{ev}</span>
            {CHANNELS.map((ch) => (
              <div key={ch} style={{ display: "flex", justifyContent: "center" }}>
                <GreenCheckbox checked={state[ev][ch]} onChange={() => toggle(ev, ch)} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <hr className="divider" />

      <div className="setting_row" style={{ width: "100%" }}>
        <div>
          <p className="setting_title">Digest Frequency</p>
          <p className="setting_sub">How often should non-critical alerts be bundled?</p>
        </div>
        <select value={digest} onChange={(e) => setDigest(e.target.value)} className="dark_select">
          {["Daily Summary", "Weekly Summary", "Real-time"].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

    </div>
  )
}

function GreenCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{
      width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? "#76b817" : "#444"}`,
      background: checked ? "#76b817" : "transparent", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {checked && <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#1a2e22", fontWeight: 700 }}>check</span>}
    </div>
  )
}