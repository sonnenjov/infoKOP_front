import { useEffect, useState } from "react"
import { apiReq } from "../../hooks/api"
import "../../styles/admin/partners_admin.css"

interface Partner {
  id: number
  email: string
  username: string
  first_name?: string
  last_name?: string
  role?: string
  phone?: string
  is_active: boolean
  is_approved: boolean
  date_joined: string
  company_profile?: {
    id: number
    company_name: string
    type: string
    address: string
    pib: string
    slug: string
    cover_photo?: string
    logo?: string
  }
}

type PendingAction = {
  partner: Partner
  action: 'approve' | 'suspend' | 'reactivate'
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Tracks the partner/action awaiting confirmation (null = modal closed)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchPartners = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiReq.get('/users/all/companies/')
      console.log('Partners response:', response.data)
      
      let data = response.data
      let partnersData: Partner[] = []
      
      if (data?.results) {
        partnersData = data.results
      } else if (Array.isArray(data)) {
        partnersData = data
      } else if (data && typeof data === 'object') {
        for (const key in data) {
          if (Array.isArray(data[key])) {
            partnersData = data[key]
            break
          }
        }
      }
      
      const partnersWithCompanies = partnersData.filter(user => user.company_profile)
      setPartners(partnersWithCompanies)
      
      if (partnersWithCompanies.length === 0) {
        setError('No partners found. Create some companies first.')
      }
      
    } catch (error: any) {
      console.error("Error fetching partners:", error)
      setError(error?.message || "Failed to load partners")
      setPartners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  const getFilteredPartners = () => {
    let filtered = partners
    
    if (filter === 'active') {
      filtered = filtered.filter(p => p.is_active && p.is_approved)
    } else if (filter === 'pending') {
      filtered = filtered.filter(p => !p.is_approved && p.is_active)
    } else if (filter === 'suspended') {
      filtered = filtered.filter(p => !p.is_active)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.company_profile?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.company_profile?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.company_profile?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.company_profile?.pib?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered
  }

  const getStatusBadge = (partner: Partner) => {
    if (!partner.is_active) {
      return <span className="status-badge suspended">Suspended</span>
    }
    if (!partner.is_approved) {
      return <span className="status-badge pending">Pending</span>
    }
    return <span className="status-badge active">Active</span>
  }

  const getCategoryIcon = (type: string | undefined) => {
    if (!type) return 'business'
    const icons: Record<string, string> = {
      hotel: 'hotel',
      apartman: 'apartment',
      restoran: 'restaurant',
      kafic: 'local_cafe',
      apres_ski: 'celebration',
      aktivnost: 'directions_bike',
      ski_skola: 'school',
      organizator: 'event',
      servis_iznajmljivanje: 'handyman',
      prevoz: 'directions_bus'
    }
    return icons[type] || 'business'
  }

  const getCategoryLabel = (type: string | undefined) => {
    if (!type) return 'N/A'
    const labels: Record<string, string> = {
      hotel: 'Hotel',
      apartman: 'Apartman',
      restoran: 'Restoran',
      kafic: 'Kafić',
      apres_ski: 'Après-ski',
      aktivnost: 'Aktivnost',
      ski_skola: 'Ski škola',
      organizator: 'Organizator',
      servis_iznajmljivanje: 'Servis',
      prevoz: 'Prevoz'
    }
    return labels[type] || type.replace(/_/g, ' ')
  }

  // approve/reactivate both hit the same endpoint (it just sets is_active=is_approved=true
  // regardless of prior state); suspend reuses the reject endpoint, since the backend
  // treats "reject a pending signup" and "suspend an active partner" identically.
  const ACTION_CONFIG: Record<PendingAction['action'], {
    endpoint: (companyId: number) => string
    needsReason: boolean
    confirmTitle: string
    confirmBody: (p: Partner) => string
    confirmLabel: string
    patch: Partial<Partner>
  }> = {
    approve: {
      endpoint: (id) => `/users/admin/companies/${id}/approve/`,
      needsReason: false,
      confirmTitle: 'Approve partner',
      confirmBody: (p) => `Approve ${p.company_profile?.company_name || p.email}? They will gain full access and receive a confirmation email.`,
      confirmLabel: 'Approve',
      patch: { is_approved: true, is_active: true },
    },
    suspend: {
      endpoint: (id) => `/users/admin/companies/${id}/reject/`,
      needsReason: true,
      confirmTitle: 'Suspend partner',
      confirmBody: (p) => `Suspend ${p.company_profile?.company_name || p.email}? They will lose access and be notified by email.`,
      confirmLabel: 'Suspend',
      patch: { is_approved: false, is_active: false },
    },
    reactivate: {
      endpoint: (id) => `/users/admin/companies/${id}/approve/`,
      needsReason: false,
      confirmTitle: 'Reactivate partner',
      confirmBody: (p) => `Reactivate ${p.company_profile?.company_name || p.email}? They will regain access and be notified by email.`,
      confirmLabel: 'Reactivate',
      patch: { is_approved: true, is_active: true },
    },
  }

  const openConfirm = (partner: Partner, action: PendingAction['action']) => {
    setActionError(null)
    setReason('')
    setPendingAction({ partner, action })
  }

  const closeConfirm = () => {
    if (actionLoading) return
    setPendingAction(null)
    setActionError(null)
    setReason('')
  }

  const confirmAction = () => {
    if (!pendingAction) return
    const { partner, action } = pendingAction
    const companyId = partner.company_profile?.id
    if (!companyId) {
      setActionError('This partner has no company profile id.')
      return
    }
    const config = ACTION_CONFIG[action]

    setActionLoading(true)
    setActionError(null)

    const body = config.needsReason ? { reason: reason.trim() || undefined } : undefined

    apiReq.post(config.endpoint(companyId), body)
      .then(() => {
        setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, ...config.patch } : p))
        setPendingAction(null)
        setReason('')
      })
      .catch((err) => {
        console.error(`Error performing ${action} on partner:`, err)
        setActionError(err?.response?.data?.error || 'Action failed. Please try again.')
      })
      .finally(() => {
        setActionLoading(false)
      })
  }

  const filteredPartners = getFilteredPartners()
  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentPartners = filteredPartners.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <main className="main_partners_admin">
        <div className="loading-state">
          <span className="material-symbols-outlined spinning">refresh</span>
          <p>Loading partners...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="main_partners_admin">
        <div className="error-state">
          <span className="material-symbols-outlined">error</span>
          <p>{error}</p>
          <button onClick={fetchPartners} className="retry-btn">Retry</button>
        </div>
      </main>
    )
  }

  return (
    <main className="main_partners_admin">
      <div className="toppart">
        <h1>Partner Management</h1>
        <div className="texts">
          <p>
            Oversee and coordinate ecosystem collaborators including hospitality providers, gear experts, and technical services.
          </p>
         
        </div>
      </div>

      <div className="inner_grid_adminpartners">
        <div style={{gridArea:"summation"}} className="summation boxpartners">
          <div className="pending">
            <div className="topparts">
              <p>Pending Approvals</p>
              <span className="material-symbols-outlined">calendar_clock</span>
            </div>
            <div className="bottomparts">
              <h1>{partners.filter(p => !p.is_approved && p.is_active).length}</h1>
              <p>! Requires Attention</p>
            </div>
          </div>

          <div className="activepartners">
            <div className="topparts">
              <p>Active Partners</p>
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div className="bottomparts">
              <h1>{partners.filter(p => p.is_active && p.is_approved).length}</h1>
              <p>
                <span className="material-symbols-outlined">trending_up</span>
              </p>
            </div>
          </div>

          <div className="suspended">
            <div className="topparts">
              <p>Suspended</p>
              <span className="material-symbols-outlined">block</span>
            </div>
            <div className="bottomparts">
              <h1>{partners.filter(p => !p.is_active).length}</h1>
              <p>
                <span className="material-symbols-outlined">info</span>
                Compliance review
              </p>
            </div>
          </div>
        </div>

        <div style={{gridArea:"listingslist"}} className="listingslist boxpartners">
          <div className="filterarrows">
            <div className="filterside">
              <div className="filterby">
                <span className="material-symbols-outlined">filter_list</span>
                <p>Filter :</p>
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="search-partners">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="arrowside">
              <p>Showing {filteredPartners.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredPartners.length)} of {filteredPartners.length} partners</p>
              <div className="buttonarrows">
                <button 
                  className='arr_left' 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="material-symbols-outlined">arrow_back_ios</span>
                </button>
                <button 
                  className='arr_right'
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <span className="material-symbols-outlined">arrow_forward_ios</span>
                </button>
              </div>
            </div>
          </div>

          <div className="titlefilters">
            <p>Partner Name</p>
            <p>Category</p>
            <p>Join Date</p>
            <p>Status</p>
            <p>Actions</p>
          </div>

          <div className="mainlist">
            {currentPartners.length === 0 ? (
              <div className="empty-state">
                <span className="material-symbols-outlined">business_off</span>
                <p>No partners found</p>
                <p className="empty-sub">Try adjusting your filters or add a new partner</p>
              </div>
            ) : (
              currentPartners.map((partner) => {
                const company = partner.company_profile
                return (
                  <div className="partner-item" key={partner.id || Math.random()}>
                    <div className="partner-name">
                      {company?.logo ? (
                        <img src={company.logo} alt={company.company_name} className="partner-logo" />
                      ) : (
                        <div className="partner-logo-placeholder">
                          <span className="material-symbols-outlined">business</span>
                        </div>
                      )}
                      <div>
                        <div className="name">{company?.company_name || partner.email || 'Unnamed Partner'}</div>
                        <div className="partner-email">{partner.email}</div>
                        <div className="pib">PIB: {company?.pib || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="partner-category">
                      <span className="category-badge">
                        <span className="material-symbols-outlined">{getCategoryIcon(company?.type)}</span>
                        {getCategoryLabel(company?.type)}
                      </span>
                    </div>
                    <div className="partner-join-date">
                      {partner.date_joined ? 
                        new Date(partner.date_joined).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'
                      }
                    </div>
                    <div className="partner-status">
                      {getStatusBadge(partner)}
                    </div>
                    <div className="partner-actions">

                      {!partner.is_approved && partner.is_active && (
                        <>
                          <button
                            className="action-btn activate"
                            title="Approve Partner"
                            onClick={() => openConfirm(partner, 'approve')}
                          >
                            <span className="material-symbols-outlined">check_circle</span>
                          </button>
                          <button
                            className="action-btn suspend"
                            title="Reject Partner"
                            onClick={() => openConfirm(partner, 'suspend')}
                          >
                            <span className="material-symbols-outlined">cancel</span>
                          </button>
                        </>
                      )}

                      {partner.is_active && partner.is_approved && (
                        <button
                          className="action-btn suspend"
                          title="Suspend Partner"
                          onClick={() => openConfirm(partner, 'suspend')}
                        >
                          <span className="material-symbols-outlined">block</span>
                        </button>
                      )}

                      {!partner.is_active && (
                        <button
                          className="action-btn activate"
                          title="Reactivate Partner"
                          onClick={() => openConfirm(partner, 'reactivate')}
                        >
                          <span className="material-symbols-outlined">check_circle</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* <div style={{gridArea:"invitation"}} className="invitation boxpartners">
          <span className="material-symbols-outlined">mail</span>
          <h1>Invite new partners</h1>
          <p>Grow the Alpine ecosystem by inviting local businesses directly to the portal.</p>
          <form onSubmit={(e) => {
            e.preventDefault()
          }}>
            <label htmlFor="mail">
              <input 
                placeholder="partner@email.com"
                type="email" 
                name="mail" 
                id="mail"
                required
              />
            </label>
            <button type="submit">
              Send Invite
            </button>
          </form>
        </div> */}

        <div style={{gridArea:"heatmap"}} className="heatmap boxpartners">
          <h1>Performance Heatmap</h1>
          <p>Real-time engagement tracking across all active partner categories.</p>
          <div className="heatmapchart">
            <div className="weekdays">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                <div key={day} className="heatmap-day">
                  <p>{day}</p>
                  <div className="heatmap-bars">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`heatbar level-${Math.floor(Math.random() * 5) + 1}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {pendingAction && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={closeConfirm}
        >
          <div
            style={{
              backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px',
              padding: '1.5em', width: '380px', maxWidth: '90vw', color: 'white',
              fontFamily: "'Jakarta Bold', sans-serif",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 0.5em 0', fontSize: '1.1em' }}>
              {ACTION_CONFIG[pendingAction.action].confirmTitle}
            </h3>
            <p style={{ margin: '0 0 1em 0', color: '#9ca3af', fontSize: '0.9em', fontFamily: "'Jakarta Regular', sans-serif" }}>
              {ACTION_CONFIG[pendingAction.action].confirmBody(pendingAction.partner)}
            </p>

            {ACTION_CONFIG[pendingAction.action].needsReason && (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (sent to the partner)"
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box', backgroundColor: '#222222',
                  border: '1px solid #2a2a2a', borderRadius: '8px', color: 'white',
                  padding: '0.6em', fontFamily: "'Jakarta Regular', sans-serif",
                  fontSize: '0.85em', resize: 'vertical', marginBottom: '1em',
                }}
              />
            )}

            {actionError && (
              <p style={{ color: '#ef4444', fontSize: '0.85em', margin: '0 0 1em 0' }}>{actionError}</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6em' }}>
              <button
                onClick={closeConfirm}
                disabled={actionLoading}
                style={{
                  backgroundColor: 'transparent', color: '#9ca3af', border: 'none',
                  padding: '0.6em 1.2em', borderRadius: '8px', cursor: 'pointer',
                  fontFamily: "'Jakarta Bold', sans-serif", fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={actionLoading}
                style={{
                  backgroundColor: pendingAction.action === 'suspend' ? '#ef4444' : '#22c55e',
                  color: 'white', border: 'none', padding: '0.6em 1.2em', borderRadius: '8px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.6 : 1,
                  fontFamily: "'Jakarta Bold', sans-serif", fontWeight: 600,
                }}
              >
                {actionLoading ? 'Working...' : ACTION_CONFIG[pendingAction.action].confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}