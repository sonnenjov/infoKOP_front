import { useState } from "react"

export default function AdminBilling() {
  const [commission, setCommission] = useState(15)
  const [payout, setPayout] = useState<"Weekly" | "Monthly">("Weekly")
  const [vatAuto, setVatAuto] = useState(true)

  return (
    <div className="main_general">

      <div style={{ width: "100%" }}>
        <p className="setting_title" style={{ marginBottom: "0.7em" }}>Platform Commission</p>
        <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
          <div style={{ display: "flex", alignItems: "center", background: "#1e1e1e", border: "1px solid #333", borderRadius: 10, overflow: "hidden", width: 120 }}>
            <input
              type="number" value={commission} min={0} max={100}
              onChange={(e) => setCommission(Number(e.target.value))}
              style={{ background: "transparent", border: "none", color: "white", padding: "0.6em 0.8em", fontSize: "1em", outline: "none", width: "100%" }}
            />
            <span style={{ color: "#555", padding: "0 0.7em", fontSize: "0.9em" }}>%</span>
          </div>
          <span style={{ color: "#666", fontSize: "0.82em" }}>Default commission applied to all partner transactions.</span>
        </div>
      </div>

      <hr className="divider" />

      <div style={{ width: "100%" }}>
        <p className="setting_title" style={{ marginBottom: "0.7em" }}>Payout Schedule</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8em" }}>
          {([
            { key: "Weekly",  sub: "Every Monday"    },
            { key: "Monthly", sub: "1st of each month" },
          ] as const).map(({ key, sub }) => (
            <div key={key} onClick={() => setPayout(key)} style={{
              background: "#1e1e1e", border: `1px solid ${payout === key ? "#76b817" : "#333"}`,
              borderRadius: 12, padding: "1em", cursor: "pointer", transition: "border 0.15s",
            }}>
              <p style={{ margin: "0 0 0.2em", fontWeight: 700, fontSize: "0.9em", color: payout === key ? "#76b817" : "white" }}>{key}</p>
              <p style={{ margin: 0, fontSize: "0.75em", color: "#666" }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <hr className="divider" />

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.9em" }}>
        <p className="setting_title">Tax & Legal Compliance</p>

        <div className="setting_row">
          <div>
            <p style={{ margin: "0 0 0.2em", fontSize: "0.88em", color: "#ddd" }}>Automated VAT Invoicing</p>
            <p style={{ margin: 0, fontSize: "0.75em", color: "#666" }}>Generate PDF invoices for all partners automatically.</p>
          </div>
          <Toggle value={vatAuto} onChange={setVatAuto} />
        </div>

        <div className="setting_row">
          <div>
            <p style={{ margin: "0 0 0.2em", fontSize: "0.88em", color: "#ddd" }}>End-of-Year Tax Report</p>
            <p style={{ margin: 0, fontSize: "0.75em", color: "#666" }}>Compile annual revenue reports for local authorities.</p>
          </div>
          <button className="ghost_btn">Configure</button>
        </div>
      </div>

    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12, cursor: "pointer", flexShrink: 0,
      background: value ? "#76b817" : "#444", position: "relative", transition: "background 0.2s",
    }}>
      <div style={{
        position: "absolute", top: 3, left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s",
      }} />
    </div>
  )
}