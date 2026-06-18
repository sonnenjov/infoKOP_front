// PartnerAnalitika.tsx
import { useState, useEffect, useCallback } from "react"
import { useOutletContext } from "react-router-dom"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { apiReq } from "../../hooks/api"
import "../../styles/partner/analytics_partner.css"

interface OutletContext {
  companyAcc?: {
    company_name: string
    address?: string
    email?: string
    role?: string
    phone?: string
    type?: string
    pib: string
    cover_photo?: string  // ADD THIS
    logo?: string         // ADD THIS
  } | null
}

interface DashboardStats {
  total_revenue: number
  total_bookings: number
  avg_booking_value: number
  revenue_trend: number
  bookings_trend: number
}

interface RevenueDataPoint {
  date: string
  revenue: number
  bookings: number
}

interface ChannelDataPoint {
  name: string
  value: number
}

interface RecentBooking {
  id: string
  guest: string
  service: string
  checkin: string
  nights: number
  amount: number
  status: 'confirmed' | 'pending' | 'cancelled'
}

const CHANNEL_COLORS = [
  "var(--weather-inactive-summer)",
  "#60a5fa",
  "#a78bfa",
  "#fb923c",
]

const STATUS_META: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Potvrđeno", cls: "ana_status_confirmed" },
  pending:   { label: "Na čekanju", cls: "ana_status_pending"   },
  cancelled: { label: "Otkazano",   cls: "ana_status_cancelled" },
}

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="ana_tooltip">
      <p className="ana_tooltip_label">{label}</p>
      <p className="ana_tooltip_val">
        {Number(payload[0].value).toLocaleString("sr-RS")} RSD
      </p>
      <p className="ana_tooltip_sub">{payload[1]?.value} rezervacija</p>
    </div>
  )
}

export default function PartnerAnalitika() {
  const context = useOutletContext<OutletContext>()
  const companyAcc = context?.companyAcc || null
  
  const [chartPeriod, setChartPeriod] = useState<"daily" | "weekly">("daily")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([])
  const [channelData, setChannelData] = useState<ChannelDataPoint[]>([])
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
       try {
      const [statsRes, revenueRes, channelRes, bookingsRes] = await Promise.all([
        apiReq.get('/rezervacije/reservations/dashboard_stats/'),
        apiReq.get('/rezervacije/reservations/revenue_trend/', { 
          params: { period: chartPeriod } 
        }),
        apiReq.get('/rezervacije/reservations/channel_distribution/'),
        apiReq.get('/rezervacije/reservations/recent_bookings/', { 
          params: { limit: 5 } 
        })
      ])

      console.log("Stats response:", statsRes.data)
      console.log("Revenue response:", revenueRes.data)
      console.log("Channel response:", channelRes.data)
      console.log("Bookings response:", bookingsRes.data)

      setStats(statsRes.data)

      let revenueDataArray = []
      if (Array.isArray(revenueRes.data)) {
        revenueDataArray = revenueRes.data
      } else if (revenueRes.data?.data && Array.isArray(revenueRes.data.data)) {
        revenueDataArray = revenueRes.data.data
      } else if (revenueRes.data?.results && Array.isArray(revenueRes.data.results)) {
        revenueDataArray = revenueRes.data.results
      }
      setRevenueData(revenueDataArray)

      let channelDataArray = []
      if (Array.isArray(channelRes.data)) {
        channelDataArray = channelRes.data
      } else if (channelRes.data?.data && Array.isArray(channelRes.data.data)) {
        channelDataArray = channelRes.data.data
      } else if (channelRes.data?.results && Array.isArray(channelRes.data.results)) {
        channelDataArray = channelRes.data.results
      }
      setChannelData(channelDataArray)

      let bookingsDataArray = []
      if (Array.isArray(bookingsRes.data)) {
        bookingsDataArray = bookingsRes.data
      } else if (bookingsRes.data?.data && Array.isArray(bookingsRes.data.data)) {
        bookingsDataArray = bookingsRes.data.data
      } else if (bookingsRes.data?.results && Array.isArray(bookingsRes.data.results)) {
        bookingsDataArray = bookingsRes.data.results
      }
      setRecentBookings(bookingsDataArray)

    } catch (err: any) {
      console.error("Error fetching analytics data:", err)
      setError(err.response?.data?.error || err.message || "Greška pri učitavanju podataka")
    } finally {
      setLoading(false)
    }
  }, [chartPeriod])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  const totalRevenue = stats?.total_revenue || revenueData.reduce((s, d) => s + (d.revenue || 0), 0)
  const totalBookings = stats?.total_bookings || revenueData.reduce((s, d) => s + (d.bookings || 0), 0)
  const avgBookingValue = stats?.avg_booking_value || (totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0)

  if (loading) {
    return (
      <main className="analytics_company">
        <div className="grid_analytics_company">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Učitavanje analitike...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="analytics_company">
        <div className="grid_analytics_company">
          <div className="error-state">
            <h3>Greška pri učitavanju</h3>
            <p>{error}</p>
            <button onClick={() => fetchAnalyticsData()}>
              Pokušaj ponovo
            </button>
          </div>
        </div>
      </main>
    )
  }

  const companyName = companyAcc?.company_name || companyAcc?.name || "Partner"

  return (
    <main className="analytics_company">
      <div className="grid_analytics_company">
        {/* UPDATED: Welcome section with cover photo */}
        <div style={{ gridArea: "b1" }} className="welcome_back boxa">
          <div 
            className="welcomeback_layout" 
            style={{ 
              backgroundImage: companyAcc?.cover_photo ? `url(${companyAcc.cover_photo})` : undefined 
            }}
          />
          <div className="welcome_back_content">
            <div className="partnerdiv">PARTNER PROFIL</div>
            <h1>{companyName}</h1>
            <p>Pregled performansi za {new Date().toLocaleString('sr-RS', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div style={{ gridArea: "b2" }} className="statistics boxa">
          <div className="statistics1 stat">
            <div className="gore">
              <span className="material-symbols-outlined">payments</span>
              <span className="ana_trend ana_trend_up">↑ {stats?.revenue_trend || 0}%</span>
            </div>
            <div className="dole">
              UKUPAN PRIHOD
              <p>{(totalRevenue / 1000).toFixed(0)}K RSD</p>
            </div>
          </div>

          <div className="statistics2 stat">
            <div className="gore">
              <span className="material-symbols-outlined">mobile_ticket</span>
              <span className="ana_trend_inv">OVAJ MESEC</span>
            </div>
            <div className="dole">
              AKTIVNE REZERVACIJE
              <p>{totalBookings}</p>
            </div>
          </div>

          <div className="statistics3 stat">
            <div className="gore">
              <span className="material-symbols-outlined">visibility</span>
              <span className="ana_trend ana_trend_up">↑ {stats?.bookings_trend || 0}%</span>
            </div>
            <div className="dole">
              PROSEK PO REZERVACIJI
              <p>{(avgBookingValue / 1000).toFixed(1)}K RSD</p>
            </div>
          </div>
        </div>

        <div style={{ gridArea: "b3" }} className="graphs boxa">
          <div style={{ gridArea: "g1" }} className="graphdiv1 bgraph">
            <div className="text">
              <div className="leftgraphtext">
                <h1>Trend prihoda</h1>
                <p>Dnevni prihod i broj rezervacija</p>
              </div>
              <div className="rightgraphtext">
                <p
                  className={chartPeriod === "daily" ? "active" : ""}
                  onClick={() => setChartPeriod("daily")}
                  style={{ cursor: "pointer" }}
                >
                  DNEVNO
                </p>
                <p
                  className={chartPeriod === "weekly" ? "active" : ""}
                  onClick={() => setChartPeriod("weekly")}
                  style={{ cursor: "pointer" }}
                >
                  NEDELJNO
                </p>
              </div>
            </div>

            <div className="ana_chart_wrap">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#76b817" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#76b817" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a1e" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#76b817", fontSize: 10, fontFamily: "JetBrain Mono" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#76b817", fontSize: 10, fontFamily: "JetBrain Mono" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v / 1000}K`}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#76b817"
                    strokeWidth={2}
                    fill="url(#revGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#76b817" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#60a5fa"
                    strokeWidth={1.5}
                    fill="none"
                    dot={false}
                    activeDot={{ r: 3, fill: "#60a5fa" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ gridArea: "g2" }} className="graphdiv2 bgraph">
            <div className="ana_channels">
              <p className="ana_section_label">KANALI PRODAJE</p>
              <div className="ana_channel_bars">
                {channelData.length > 0 ? (
                  channelData.map((ch, i) => (
                    <div key={ch.name} className="ana_channel_row">
                      <span className="ana_channel_name">{ch.name}</span>
                      <div className="ana_channel_track">
                        <div
                          className="ana_channel_fill"
                          style={{ 
                            width: `${Math.min(ch.value, 100)}%`, 
                            background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] 
                          }}
                        />
                      </div>
                      <span className="ana_channel_pct">{ch.value}%</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#c1cab2', textAlign: 'center', padding: '20px 0' }}>
                    Nema podataka o kanalima
                  </p>
                )}
              </div>
            </div>

            <hr style={{ borderColor: "#1e2a1e", margin: "0.8rem 0" }} />

            <div className="g">
              <h1>Poslednje rezervacije</h1>
            </div>
            <hr style={{ borderColor: "#1e2a1e", margin: "0.5rem 0" }} />
            <div className="names">
              <p>Gost</p>
              <p>Usluga</p>
              <p>Iznos</p>
              <p>Status</p>
            </div>

            <div className="ana_bookings_list">
              {recentBookings.length > 0 ? (
                recentBookings.map((b) => {
                  const s = STATUS_META[b.status] || STATUS_META.pending
                  return (
                    <div key={b.id} className="ana_booking_row">
                      <div className="ana_booking_guest">
                        <span className="ana_booking_name">{b.guest}</span>
                        <span className="ana_booking_id">{b.id}</span>
                      </div>
                      <span className="ana_booking_service">{b.service}</span>
                      <span className="ana_booking_amount">
                        {b.amount.toLocaleString("sr-RS")} RSD
                      </span>
                      <span className={`ana_badge ${s.cls}`}>{s.label}</span>
                    </div>
                  )
                })
              ) : (
                <p style={{ color: '#c1cab2', textAlign: 'center', padding: '20px 0' }}>
                  Nema nedavnih rezervacija
                </p>
              )}
            </div>

            <hr style={{ borderColor: "#1e2a1e", margin: "0.6rem 0" }} />
            <p className="ana_view_all" onClick={() => window.location.href = "/partner/rezervacije"}>
              Sve rezervacije{" "}
              <span className="material-symbols-outlined" style={{ fontSize: "0.9rem", verticalAlign: "middle" }}>
                arrow_forward_ios
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}