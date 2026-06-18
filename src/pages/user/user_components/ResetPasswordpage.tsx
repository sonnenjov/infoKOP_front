import { FormEvent, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import "../../../styles/auth.css"


export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uid = searchParams.get("uid") || ""
  const token = searchParams.get("token") || ""

  const [passwords, setPasswords] = useState({ new_password: "", confirm_password: "" })
  const [activeEye, setActiveEye] = useState<"closed" | "open">("closed")
  const [activeEyeConfirm, setActiveEyeConfirm] = useState<"closed" | "open">("closed")
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (passwords.new_password.length < 8) {
      setError("Lozinka mora imati najmanje 8 karaktera.")
      return
    }
    if (passwords.new_password !== passwords.confirm_password) {
      setError("Lozinke se ne poklapaju.")
      return
    }

    setStatus("saving")
    try {
      const res = await fetch("http://192.168.1.6:8000/api/users/password-reset/confirm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password: passwords.new_password }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setStatus("success")
        setTimeout(() => navigate("/login"), 2500)
      } else {
        setError(data.error || "Greška pri resetovanju lozinke.")
        setStatus("error")
      }
    } catch {
      setError("Mrežna greška")
      setStatus("error")
    }
  }

  if (!uid || !token) {
    return (
      <div className="auth_page">
        <div className="auth_box boxs">
          <div className="frst">
            <span className="material-symbols-outlined">error</span>
            Nevažeći link
          </div>
          <p className="auth_subtext">Link za resetovanje lozinke nije važeći ili je nepotpun.</p>
          <Link to="/forgot-password" className="auth_link">Zatražite novi link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth_page">
      <form className="auth_box boxs" onSubmit={handleSubmit}>
        <div className="frst">
          <span className="material-symbols-outlined">lock_reset</span>
          Nova lozinka
        </div>

        {status === "success" ? (
          <div className="auth_success">
            <span className="material-symbols-outlined success_icon">check_circle</span>
            <p>Lozinka je uspešno promenjena. Preusmeravamo vas na prijavu...</p>
          </div>
        ) : (
          <>
            <label className="auth_label" htmlFor="new-password">
              NOVA LOZINKA
              <div className="password_field">
                <input
                  id="new-password"
                  type={activeEye === "closed" ? "password" : "text"}
                  required
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                />
                <span
                  className="material-symbols-outlined login_icon"
                  onClick={() => setActiveEye((p) => (p === "closed" ? "open" : "closed"))}
                >
                  {activeEye === "closed" ? "visibility_off" : "visibility"}
                </span>
              </div>
            </label>

            <label className="auth_label" htmlFor="confirm-password">
              POTVRDI LOZINKU
              <div className="password_field">
                <input
                  id="confirm-password"
                  type={activeEyeConfirm === "closed" ? "password" : "text"}
                  required
                  value={passwords.confirm_password}
                  onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                />
                <span
                  className="material-symbols-outlined login_icon"
                  onClick={() => setActiveEyeConfirm((p) => (p === "closed" ? "open" : "closed"))}
                >
                  {activeEyeConfirm === "closed" ? "visibility_off" : "visibility"}
                </span>
              </div>
            </label>

            {error && <p className="auth_error">{error}</p>}

            <button type="submit" disabled={status === "saving"}>
              {status === "saving" ? "Čuvanje..." : "Promeni lozinku"}
            </button>
          </>
        )}
      </form>
    </div>
  )
}