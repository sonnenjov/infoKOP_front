import { useState, useEffect } from "react";
import { getToken } from "../../hooks/auth";
import "../../styles/admin/admin_approvals.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";

interface CompanyUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface PendingCompany {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  type: string;
  address: string;
  pib: string;
  created_at: string;
  user: CompanyUser;
}

type ActionState = "idle" | "loading" | "success" | "error";

export default function AdminApprovals() {
  const [companies, setCompanies] = useState<PendingCompany[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [actionStates, setActionStates] = useState<Record<number, ActionState>>({});
  const navigate = useNavigate()
  const [rejectModal, setRejectModal] = useState<{ open: boolean; companyId: number | null; reason: string }>({
    open: false,
    companyId: null,
    reason: "",
  });

  const fetchPending = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/api/admin/companies/pending/?page_size=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCompanies(data.results ?? []);
      setTotal(data.total ?? 0);
      setError(null);
      // navigate('/admin/dashboard')
    } catch (err) {
      setError("Failed to load pending companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const setAction = (id: number, state: ActionState) =>
    setActionStates((prev) => ({ ...prev, [id]: state }));

  const handleApprove = async (id: number): Promise<void> => {
    setAction(id, "loading");
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/admin/companies/${id}/approve/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setAction(id, "success");
      setTimeout(() => {
        setCompanies((prev) => prev.filter((c) => c.id !== id));
        setTotal((prev) => prev - 1);
      }, 800);
    } catch {
      setAction(id, "error");
      setTimeout(() => setAction(id, "idle"), 2000);
    }
  };

  const handleReject = async (): Promise<void> => {
    const { companyId, reason } = rejectModal;
    if (!companyId) return;
    setAction(companyId, "loading");
    setRejectModal({ open: false, companyId: null, reason: "" });
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/admin/companies/${companyId}/reject/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error();
      setAction(companyId, "success");
      setTimeout(() => {
        setCompanies((prev) => prev.filter((c) => c.id !== companyId));
        setTotal((prev) => prev - 1);
      }, 800);
    } catch {
      setAction(companyId, "error");
      setTimeout(() => setAction(companyId, "idle"), 2000);
    }
  };

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString("sr-RS", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <main className="approvals_main">
      <div className="approvals_header">
        <div className="approvals_title">
          <span className="material-symbols-outlined">domain_verification</span>
          <div>
            <h1>Company Approvals</h1>
            <p>{total} pending {total === 1 ? "request" : "requests"}</p>
          </div>
        </div>
        <button className="refresh_btn" onClick={fetchPending}>
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </div>

      {error && (
        <div className="approvals_error">
          <span className="material-symbols-outlined">error</span>
          {error}
          <button onClick={fetchPending}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="approvals_loading">
          <div className="appr_spinner"></div>
          <p>Loading pending companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="approvals_empty">
          <span className="material-symbols-outlined">check_circle</span>
          <p>No pending approvals</p>
        </div>
      ) : (
        <div className="approvals_grid">
          {companies.map((company) => {
            const state = actionStates[company.id] ?? "idle";
            return (
              <div
                key={company.id}
                className={`approval_card ${state === "success" ? "card_success" : state === "error" ? "card_error" : ""}`}
              >
                <div className="card_top">
                  <div className="card_avatar">
                    {company.company_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="card_identity">
                    <h2>{company.company_name}</h2>
                    <span className="card_type">{company.type}</span>
                  </div>
                </div>

                <div className="card_details">
                  <div className="detail_row">
                    <span className="material-symbols-outlined">mail</span>
                    <span>{company.email}</span>
                  </div>
                  {company.phone && (
                    <div className="detail_row">
                      <span className="material-symbols-outlined">call</span>
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.address && (
                    <div className="detail_row">
                      <span className="material-symbols-outlined">location_on</span>
                      <span>{company.address}</span>
                    </div>
                  )}
                  {company.pib && (
                    <div className="detail_row">
                      <span className="material-symbols-outlined">badge</span>
                      <span>PIB: {company.pib}</span>
                    </div>
                  )}
                  <div className="detail_row">
                    <span className="material-symbols-outlined">calendar_today</span>
                    <span>Registered {formatDate(company.created_at)}</span>
                  </div>
                </div>

                <div className="card_owner">
                  <span className="material-symbols-outlined">person</span>
                  <span>
                    {company.user.first_name} {company.user.last_name} &middot; {company.user.email}
                  </span>
                </div>

                <div className="card_actions">
                  <button
                    className="btn_reject"
                    disabled={state === "loading" || state === "success"}
                    onClick={() => setRejectModal({ open: true, companyId: company.id, reason: "" })}
                  >
                    <span className="material-symbols-outlined">close</span>
                    Reject
                  </button>
                  <button
                    className="btn_approve"
                    disabled={state === "loading" || state === "success"}
                    onClick={() => handleApprove(company.id)}
                  >
                    {state === "loading" ? (
                      <span className="btn_spinner"></span>
                    ) : state === "success" ? (
                      <span className="material-symbols-outlined">check</span>
                    ) : (
                      <span className="material-symbols-outlined">check</span>
                    )}
                    {state === "loading" ? "Processing..." : state === "success" ? "Done" : "Approve"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectModal.open && (
        <div className="modal_overlay" onClick={() => setRejectModal({ open: false, companyId: null, reason: "" })}>
          <div className="modal_box" onClick={(e) => e.stopPropagation()}>
            <div className="modal_header">
              <span className="material-symbols-outlined">block</span>
              <h2>Reject Company</h2>
            </div>
            <p>Provide a reason for rejection (optional).</p>
            <textarea
              className="modal_textarea"
              placeholder="e.g. Incomplete documentation, invalid PIB..."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
              rows={4}
            />
            <div className="modal_actions">
              <button
                className="modal_cancel"
                onClick={() => setRejectModal({ open: false, companyId: null, reason: "" })}
              >
                Cancel
              </button>
              <button className="modal_confirm" onClick={handleReject}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}