import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Listing {
  id: number;
  title: string;
  price: string;
  type: string;
  owner: string;
  status: "FLAGGED" | "NEW" | "VERIFIED" | "APPROVED" | "PENDING";
  flag: string;
  img: string;
}

interface Log {
  icon: string;
  label: string;
  sub: string;
  badge: string;
  color: string;
}

// ─── Mock data (replace with API fetch) ───────────────────────────────────────

const MOCK_LISTINGS: Listing[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  title:  ["Summit Peak Chalet", "Glacier Sprint Tour", "The Pine Hearth", "K2 Rental Center", "Apex Gear Rental", "Blue Ridge Lodge", "Skyline Bistro", "Iron Peak Suites"][i % 8],
  price:  ["$1,200/nt", "$245/pp", "$$$$", "$65/day", "$89/nt", "$320/nt", "$55/pp", "$180/nt"][i % 8],
  type:   ["Accommodation", "Activities", "Gastronomy", "Rentals", "Accommodation", "Accommodation", "Gastronomy", "Accommodation"][i % 8],
  owner:  ["Marc Alpine Estates", "Ice Adventures Ltd.", "Chef Erik Vana", "K2 Sports Global", "Apex Co.", "Blue Ridge Co.", "User_031", "Iron Group"][i % 8],
  status: ["FLAGGED", "NEW", "FLAGGED", "VERIFIED", "APPROVED", "PENDING", "FLAGGED", "VERIFIED"][i % 8] as Listing["status"],
  flag:   ["SUSPICIOUS · ACCOMMODATION", "NEW SUBMISSION", "POLICY VIOLATION", "", "", "", "PENDING REVIEW", ""][i % 8],
  img:    ["🏔️", "🏂", "🍽️", "🏪", "🎿", "🏕️", "🍷", "🏨"][i % 8],
}));

const MOCK_LOGS: Log[] = [
  { icon: "check_circle",  label: 'Verified: "Apex Gear Rental"',     sub: "Admin J. Week · 3m ago",  badge: "APPROVED", color: "#76b817" },
  { icon: "visibility_off",label: 'Hidden: "Illegal Camping Spot"',   sub: "System · 13m ago",         badge: "REJECTED", color: "#e53935" },
  { icon: "flag",          label: 'Flagged: "Skyline Bistro" Review', sub: "User_031 · 3h ago",        badge: "PENDING",  color: "#888"    },
  { icon: "check_circle",  label: 'Verified: "Blue Ridge Lodge"',     sub: "Admin J. Week · 5h ago",   badge: "APPROVED", color: "#76b817" },
  { icon: "flag",          label: 'Flagged: "Iron Peak Suites"',      sub: "User_014 · 6h ago",        badge: "PENDING",  color: "#888"    },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_FILTERS   = ["All Types", "Accommodation", "Gastronomy", "Activities", "Rentals"];
const STATUS_FILTERS = ["All", "FLAGGED", "NEW", "VERIFIED", "PENDING", "APPROVED"];
const PER_PAGE = 9;

const STATUS_COLORS: Record<string, string> = {
  FLAGGED:  "#e53935",
  NEW:      "#76b817",
  VERIFIED: "#76b817",
  APPROVED: "#76b817",
  PENDING:  "#f59e0b",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ListingCard({ listing, selected, onToggle }: {
  listing: Listing;
  selected: boolean;
  onToggle: () => void;
}) {
  const flagColor = listing.status === "FLAGGED" ? "#c62828" : "#1a2e22";
  const flagText  = listing.status === "FLAGGED" ? "#ffcdd2" : "#76b817";

  return (
    <div onClick={onToggle} style={{
      background: "#1a1a1a",
      borderRadius: 14,
      overflow: "hidden",
      cursor: "pointer",
      border: `2px solid ${selected ? "#76b817" : "transparent"}`,
      transition: "border 0.15s",
    }}>
      <div style={{ background: "#2a2a2a", height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3em", position: "relative" }}>
        {listing.img}
        {listing.flag && (
          <span style={{ position: "absolute", top: 8, left: 8, background: flagColor, color: flagText, fontSize: "0.22em", padding: "0.3em 0.7em", borderRadius: 6, fontWeight: 700, letterSpacing: "0.05em" }}>
            {listing.flag}
          </span>
        )}
      </div>

      <div style={{ padding: "0.8em" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3em" }}>
          <span style={{ fontWeight: 700, fontSize: "0.88em" }}>{listing.title}</span>
          <span style={{ color: "#76b817", fontWeight: 700, fontSize: "0.82em" }}>{listing.price}</span>
        </div>
        <p style={{ margin: "0 0 0.7em", color: "#666", fontSize: "0.75em" }}>{listing.owner}</p>

        <div style={{ display: "flex", gap: "0.4em" }}>
          {(["Verify", "Flag", "Hide"] as const).map((action) => (
            <button key={action} onClick={(e) => e.stopPropagation()} style={{
              flex: 1, padding: "0.4em 0", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.72em", fontWeight: 600,
              background: action === "Verify" ? "#1a2e22" : action === "Flag" ? "#2a1515" : "#1a1a2e",
              color:      action === "Verify" ? "#76b817" : action === "Flag" ? "#e53935" : "#7986cb",
            }}>
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogItem({ log }: { log: Log }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.7em", background: "#121212", borderRadius: 10, padding: "0.7em" }}>
      <span className="material-symbols-outlined" style={{ color: log.color, fontSize: 18, flexShrink: 0 }}>{log.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 0.2em", fontSize: "0.8em", color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.label}</p>
        <p style={{ margin: 0, fontSize: "0.7em", color: "#555" }}>{log.sub}</p>
      </div>
      <span style={{ background: log.color + "22", color: log.color, fontSize: "0.65em", fontWeight: 700, padding: "0.2em 0.5em", borderRadius: 6, whiteSpace: "nowrap" }}>
        {log.badge}
      </span>
    </div>
  );
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const items: (number | "…")[] = Array.from({ length: total }, (_, i) => i + 1)
    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
      if (p === 1 || p === total || Math.abs(p - page) <= 1) {
        if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push("…");
        acc.push(p);
      }
      return acc;
    }, []);

  const btn = (label: string, target: number, disabled: boolean) => (
    <button onClick={() => onChange(target)} disabled={disabled} style={{
      background: "#333", border: "none", borderRadius: 8,
      color: disabled ? "#444" : "white",
      padding: "0.4em 0.7em", cursor: disabled ? "default" : "pointer", fontSize: "0.8em",
    }}>{label}</button>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
      {btn("«", 1, page === 1)}
      {btn("‹", page - 1, page === 1)}
      {items.map((p, i) =>
        p === "…"
          ? <span key={`e${i}`} style={{ color: "#555", fontSize: "0.8em", padding: "0 0.2em" }}>…</span>
          : <button key={p} onClick={() => onChange(p)} style={{
              background: page === p ? "#76b817" : "#333",
              color:      page === p ? "#1a2e22"  : "white",
              border: "none", borderRadius: 8, padding: "0.4em 0.75em",
              cursor: "pointer", fontSize: "0.8em", fontWeight: page === p ? 700 : 400,
            }}>{p}</button>
      )}
      {btn("›", page + 1, page === total)}
      {btn("»", total,    page === total)}
    </div>
  );
}


export default function ModerationPage() {
  const [typeFilter,   setTypeFilter]   = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [selected,     setSelected]     = useState<Set<number>>(new Set());

  const listings = MOCK_LISTINGS;
  const logs     = MOCK_LOGS;

  const filtered = listings.filter((l) => {
    const byType   = typeFilter   === "All Types" || l.type   === typeFilter;
    const byStatus = statusFilter === "All"       || l.status === statusFilter;
    const bySearch = l.title.toLowerCase().includes(search.toLowerCase())
                  || l.owner.toLowerCase().includes(search.toLowerCase());
    return byType && byStatus && bySearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const flagged    = listings.filter((l) => l.status === "FLAGGED").length;
  const newCount   = listings.filter((l) => l.status === "NEW").length;

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const setFilter = (type: string, status: string) => {
    setTypeFilter(type);
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div style={{ background: "#121212", minHeight: "100vh", color: "white", fontFamily: "system-ui, sans-serif", padding: "1.5em" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1em", marginBottom: "1.5em" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8em", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: "1.4em", fontWeight: 700 }}>Content Moderation</h1>
          <Badge label={`${flagged} Flagged`}  bg="#2a1515" color="#e53935" icon="flag"       />
          <Badge label={`${newCount} New`}      bg="#1a2e22" color="#76b817" icon="add_circle" />
        </div>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: "1.2em", alignItems: "start" }}>

        <div style={{ background: "#222222", borderRadius: 16, padding: "1.2em", display: "flex", flexDirection: "column", gap: "1em" }}>

          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5em" }}>
            <FilterGroup options={TYPE_FILTERS}   active={typeFilter}   onChange={(v) => setFilter(v, statusFilter)} pill />
            <FilterGroup options={STATUS_FILTERS} active={statusFilter} onChange={(v) => setFilter(typeFilter, v)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1em" }}>
            {paginated.map((l) => (
              <ListingCard key={l.id} listing={l} selected={selected.has(l.id)} onToggle={() => toggleSelect(l.id)} />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#555", fontSize: "0.78em" }}>
              {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <Pagination page={page} total={totalPages} onChange={setPage} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.2em" }}>

          <div style={{ background: "#222222", borderRadius: 16, padding: "1.2em" }}>
            <h3 style={{ margin: "0 0 1em", fontSize: "0.9em" }}>Partner Health</h3>
            {[
              { label: "Listing Quality Score", value: "94%", pct: 94 },
              { label: "Avg. Response Time",    value: "2.4h", pct: 60 },
              { label: "Auto-Moderation Rate",  value: "88%", pct: 88 },
            ].map((m) => (
              <div key={m.label} style={{ marginBottom: "0.9em" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35em" }}>
                  <span style={{ fontSize: "0.78em", color: "#888" }}>{m.label}</span>
                  <span style={{ fontSize: "0.78em", color: "#76b817", fontWeight: 700 }}>{m.value}</span>
                </div>
                <div style={{ background: "#333", borderRadius: 3, height: 3 }}>
                  <div style={{ width: `${m.pct}%`, height: 3, borderRadius: 3, background: "#76b817" }} />
                </div>
              </div>
            ))}
            <p style={{ margin: "1em 0 0.5em", fontSize: "0.68em", color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>Coverage</p>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 36 }}>
              {[60, 75, 55, 80, 70, 90, 65].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? "#76b817" : "#333", borderRadius: "3px 3px 0 0" }} />
              ))}
            </div>
          </div>

          <div style={{ background: "#222222", borderRadius: 16, padding: "1.2em" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9em" }}>
              <h3 style={{ margin: 0, fontSize: "0.9em" }}>Recent Actions</h3>
              <button style={{ background: "none", border: "none", color: "#76b817", fontSize: "0.75em", cursor: "pointer" }}>View all</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
              {logs.map((log, i) => <LogItem key={i} log={log} />)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


function Badge({ label, bg, color, icon }: { label: string; bg: string; color: string; icon: string }) {
  return (
    <span style={{ background: bg, color, border: `1px solid ${color}44`, borderRadius: 8, padding: "0.25em 0.75em", fontSize: "0.78em", display: "flex", alignItems: "center", gap: "0.35em" }}>
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{icon}</span>
      {label}
    </span>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: "relative" }}>
      <span className="material-symbols-outlined" style={{ position: "absolute", left: "0.7em", top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 17, pointerEvents: "none" }}>search</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search listings or owners…"
        style={{ background: "#222", border: "1px solid #333", borderRadius: 10, padding: "0.5em 0.8em 0.5em 2.3em", color: "white", fontSize: "0.83em", outline: "none", width: 260 }} />
    </div>
  );
}

function FilterGroup({ options, active, onChange, pill }: { options: string[]; active: string; onChange: (v: string) => void; pill?: boolean }) {
  return (
    <div style={{ display: "flex", gap: "0.35em", flexWrap: "wrap" }}>
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            background: isActive ? (pill ? "#76b817" : "#333") : "transparent",
            color:      isActive ? (pill ? "#1a2e22"  : "white") : "#555",
            border:     `1px solid ${isActive ? (pill ? "#76b817" : "#444") : "transparent"}`,
            borderRadius: 8, padding: pill ? "0.3em 0.85em" : "0.25em 0.65em",
            cursor: "pointer", fontSize: "0.78em", fontWeight: isActive ? 700 : 400,
          }}>{opt}</button>
        );
      })}
    </div>
  );
}