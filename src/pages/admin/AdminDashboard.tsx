
import { useState, useEffect } from "react";
import Weather_accounts from "../../layouts/Weather_accounts";
import "../../styles/admin/dashboard_admin.css";
import { getToken } from "../../hooks/auth";
import { API_URL } from "../../config";

interface TrafficItem {
  value: number;
  count: number;
  label: string;
}

interface LogItem {
  timestamp: string;
  message: string;
  type: string;
}

interface SystemLoad {
  api: number;
  database: number;
  cdn: number;
}

interface Company {
  id: number;
  company_name: string;
  email: string;
  type: string;
  created_at: string;
  is_approved: boolean;
}

interface DashboardStats {
  totalPartners: number;
  activeListings: number;
  dailyActiveUsers: number;
  serverUptime: number | string;
  pendingApprovals: number;
  recentLogs: LogItem[];
  bookingTraffic: TrafficItem[];
  systemLoad: SystemLoad;
  recentCompanies: Company[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPartners: 0,
    activeListings: 0,
    dailyActiveUsers: 0,
    serverUptime: "99.9%",
    pendingApprovals: 0,
    recentLogs: [],
    bookingTraffic: [],
    systemLoad: {
      api: 12,
      database: 45,
      cdn: 82,
    },
    recentCompanies: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/admin/dashboard/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();

      setStats({
        totalPartners: data.total_partners ?? 0,
        activeListings: data.active_listings ?? 0,
        dailyActiveUsers: data.daily_active_users ?? 0,
        serverUptime: data.server_uptime ?? "99.9%",
        pendingApprovals: data.pending_approvals ?? 0,
        recentLogs: data.recent_logs ?? [],
        bookingTraffic: data.booking_traffic ?? [],
        systemLoad: data.system_load ?? { api: 12, database: 45, cdn: 82 },
        recentCompanies: data.recent_companies ?? [],
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initTimer = setTimeout(() => fetchDashboardData(), 0);
    const interval = setInterval(fetchDashboardData, 30000);
    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, []);

 const formatUptime = (uptime: number | string): string => {
  const num = typeof uptime === "string" ? parseFloat(uptime) : uptime;
  if (!isNaN(num) && !String(uptime).includes("%")) {
    const hours = Math.floor(num / 3600);
    const minutes = Math.floor((num % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  return String(uptime);
};

  if (loading && stats.totalPartners === 0) {
    return (
      <main className="admin_dashboard_main">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin_dashboard_main">
      {error && (
        <div className="error-banner">
          <span className="material-symbols-outlined">error</span>
          {error}
          <button onClick={fetchDashboardData}>Retry</button>
        </div>
      )}

      <div className="inner_grid_admin">
        <div style={{ gridArea: "summed" }} className="summed grid_el_admin">
          <div className="totpart layout">
            <div className="totpart_up">
              <span className="material-symbols-outlined">handshake</span>
              <p>+12%</p>
            </div>
            <div className="totpart_down">
              <p>TOTAL PARTNERS</p>
              <h2>{stats.totalPartners}</h2>
            </div>
          </div>


          <div className="activeuse layout">
            <div className="activeuse_up">
              <span className="material-symbols-outlined">group</span>
              <p>+23%</p>
            </div>
            <div className="activeuse_down">
              <p>DAILY ACTIVE USERS</p>
              <h2>{stats.dailyActiveUsers}</h2>
            </div>
          </div>

          <div className="serverup layout">
            <div className="serverup_up">
              <span className="material-symbols-outlined">hard_drive</span>
              <p>
                <span className="material-symbols-outlined spandot">
                  signal_wifi_4_bar
                </span>
                LIVE
              </p>
            </div>
            <div className="serverup_down">
              <p>SERVER UPTIME</p>
              <h2>{formatUptime(stats.serverUptime)}</h2>
            </div>
          </div>
        </div>

        <div style={{ gridArea: "traffic" }} className="traffic grid_el_admin">
          <div className="firstpart">
            <div className="leftpart">
              <h1>Company Registrations</h1>
              <p>Real-time Activity</p>
            </div>
            <div className="rightpart">
            </div>
          </div>

          <div className="middlepart">
            {stats.bookingTraffic && stats.bookingTraffic.length > 0 ? (
              <div className="traffic-chart">
                {stats.bookingTraffic.map((item: TrafficItem, index: number) => (
                  <div
                    key={index}
                    className="traffic-bar"
                    style={{ height: `${item.value}%` }}
                    title={`${item.count ?? 0} registrations at ${item.label}`}
                  >
                    <span className="traffic-label">{item.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No traffic data available</p>
            )}
          </div>

          <div className="downpart">
            <div className="traffic-stats">
              <div className="stat-item">
                <span className="stat-label">Total Today</span>
                <span className="stat-value">
                  {stats.bookingTraffic?.reduce(
                    (sum: number, item: TrafficItem) => sum + (item.count ?? 0),
                    0
                  ) ?? 0}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Peak Hour</span>
                <span className="stat-value">
                  {stats.bookingTraffic?.reduce(
                    (max: TrafficItem, item: TrafficItem) =>
                      (item.count ?? 0) > (max.count ?? 0) ? item : max,
                    { label: "--:00", count: 0, value: 0 }
                  ).label ?? "--:00"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{ gridArea: "system_logs" }}
          className="system_logs grid_el_admin"
        >
          <h1>Recent System Logs</h1>
          <div className="logslist">
            {stats.recentLogs && stats.recentLogs.length > 0 ? (
              stats.recentLogs.map((log: LogItem, index: number) => (
                <div key={index} className="log-item">
                  <div className="log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="log-message">{log.message}</div>
                  <div className={`log-status ${log.type}`}>{log.type}</div>
                </div>
              ))
            ) : (
              <p className="no-data">No recent logs</p>
            )}
          </div>
        </div>

        <div style={{ gridArea: "actions" }} className="actions grid_el_admin">
          <div className="upactions">
            <span className="material-symbols-outlined">calendar_clock</span>
            Pending Actions
            <span className="badge">{stats.pendingApprovals}</span>
          </div>

          <div className="midactions">
            <div className="midact_inner">
              <div className="u">
                <p>Company Approvals</p>
                <p>New</p>
              </div>
              <div className="m">
                <div className="circles">
                  {stats.recentCompanies
                    ?.slice(0, 3)
                    .map((company: Company, i: number) => (
                      <div
                        key={i}
                        className="circle"
                        title={company.company_name}
                      >
                        {company.company_name?.charAt(0).toUpperCase() ?? "C"}
                      </div>
                    ))}
                  {stats.pendingApprovals > 3 && (
                    <div className="circle">+{stats.pendingApprovals - 3}</div>
                  )}
                </div>
                <button
                  className="review"
                  onClick={() =>
                    (window.location.href = "/admin/approvals")
                  }
                >
                  REVIEW ALL
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ gridArea: "weather" }} className="weather grid_el_admin">
          <Weather_accounts />
        </div>

        <div
          style={{ gridArea: "system_load" }}
          className="system_load grid_el_admin"
        >
          <p className="titles">System Load</p>
          <div className="percents">
            <div className="row">
              <div className="meta">
                <span className="name">API Server</span>
                <span className="pct">{stats.systemLoad.api}%</span>
              </div>
              <div className="track">
                <div
                  className="fill"
                  style={{ width: `${stats.systemLoad.api}%` }}
                ></div>
              </div>
            </div>
            <div className="row">
              <div className="meta">
                <span className="name">Database</span>
                <span className="pct">{stats.systemLoad.database}%</span>
              </div>
              <div className="track">
                <div
                  className="fill"
                  style={{ width: `${stats.systemLoad.database}%` }}
                ></div>
              </div>
            </div>
            <div className="row">
              <div className="meta">
                <span className="name">CDN Cache</span>
                <span className="pct">{stats.systemLoad.cdn}%</span>
              </div>
              <div className="track">
                <div
                  className="fill"
                  style={{ width: `${stats.systemLoad.cdn}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}