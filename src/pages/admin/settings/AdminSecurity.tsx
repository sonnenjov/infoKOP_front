import { useState } from "react"

export default function AdminSecurity() {
  const [twoFA, setTwoFA] = useState(true)
  const [timeout, setTimeout_] = useState("30 Minutes")
  const [checks, setChecks] = useState({ min12: true, special: true, reset90: false })
  const [ips, setIps] = useState([{ addr: "192.168.1.1", label: "Office HQ" }])

  const toggle = (key: keyof typeof checks) =>
    setChecks((p) => ({ ...p, [key]: !p[key] }))

  return (
    <div className="main_general">

      <div className="setting_row">
        <div>
          <p className="setting_title">Two-Factor Authentication (2FA)</p>
          <p className="setting_sub">Require all admin accounts to verify login via Authenticator App.</p>
        </div>
        <Toggle value={twoFA} onChange={setTwoFA} />
      </div>

      <hr className="divider" />

      <div className="setting_row">
        <div>
          <p className="setting_title">Session Timeout</p>
          <p className="setting_sub">Automatically log out inactive users.</p>
        </div>
        <select value={timeout} onChange={(e) => setTimeout_(e.target.value)} className="dark_select">
          {["15 Minutes", "30 Minutes", "1 Hour", "4 Hours"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>

      <hr className="divider" />

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.7em" }}>
        <p className="setting_title">Password Strength Policy</p>
        {([
          { key: "min12",   label: "Require minimum 12 characters" },
          { key: "special", label: "Require special characters and numbers" },
          { key: "reset90", label: "Force password reset every 90 days" },
        ] as const).map(({ key, label }) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.7em", cursor: "pointer", fontSize: "0.88em", color: "#ccc" }}>
            <GreenCheckbox checked={checks[key]} onChange={() => toggle(key)} />
            {label}
          </label>
        ))}
      </div>

      <hr className="divider" />

      <div style={{ width: "100%" }}>
        <div className="setting_row" style={{ marginBottom: "0.8em" }}>
          <p className="setting_title">Admin IP Whitelisting</p>
          <button className="ghost_btn">+ Add IP</button>
        </div>
        {ips.map((ip, i) => (
          <div key={i} className="ip_row">
            <span style={{ fontFamily: "monospace", fontSize: "0.9em" }}>{ip.addr}</span>
            <span style={{ color: "#666", fontSize: "0.8em" }}>{ip.label}</span>
          </div>
        ))}
        <p style={{ fontSize: "0.72em", color: "#555", marginTop: "0.6em" }}>Only these IPs will be able to access the admin portal.</p>
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

function GreenCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{
      width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? "#76b817" : "#555"}`,
      background: checked ? "#76b817" : "transparent", cursor: "pointer", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {checked && <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#1a2e22", fontWeight: 700 }}>check</span>}
    </div>
  )
}