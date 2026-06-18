import { FormEvent, useState } from "react"
import { Link } from "react-router-dom"
import "../../../styles/auth.css"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setStatus("sending")

    try {
      const res = await fetch("http://192.168.1.6:8000/api/users/password-reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus("sent")
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Greška pri slanju. Pokušajte ponovo.")
        setStatus("error")
      }
    } catch {
      setError("Mrežna greška")
      setStatus("error")
    }
  }

  return (
    <div className="auth_page">
      <form className="auth_box boxs" onSubmit={handleSubmit}>
        <div className="frst">
          <span className="material-symbols-outlined">lock_reset</span>
          Zaboravljena lozinka
        </div>

        {status === "sent" ? (
          <div className="auth_success">
            <span className="material-symbols-outlined success_icon">mark_email_read</span>
            <p>Ako nalog sa ovom email adresom postoji, link za resetovanje lozinke je poslat.</p>
            <Link to="/login" className="auth_link">Nazad na prijavu</Link>
          </div>
        ) : (
          <>
            <p className="auth_subtext">
              Unesite email adresu povezanu sa vašim nalogom i poslaćemo vam link za resetovanje lozinke.
            </p>

            <label className="auth_label" htmlFor="reset-email">
              EMAIL ADRESA
              <input
                id="reset-email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.com"
              />
            </label>

            {error && <p className="auth_error">{error}</p>}

            <button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Slanje..." : "Pošalji link za resetovanje"}
            </button>

            <Link to="/login" className="auth_link">Nazad na prijavu</Link>
          </>
        )}
      </form>
    </div>
  )
}