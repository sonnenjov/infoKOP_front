import { useEffect, useState } from "react"
import { apiReq } from "../../hooks/api"
import "../../styles/admin/users_admin.css"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  phone: string
  avatar?: string
  avatar_url?: string
  email_confirmed: boolean
  is_approved: boolean
  is_active: boolean
  date_joined: string
  last_login: string | null
  company_profile?: {
    company_name: string
    type: string
  }
}

type PendingAction = {
  user: User
  action: 'approve' | 'reject' | 'ban' | 'unban'
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)
  const [filter, setFilter] = useState('all') // all, active, pending, banned
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Tracks the user/action awaiting confirmation in the modal (null = modal closed)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchUsers = () => {
    setLoading(true)
    apiReq.get('/users/all/users/')
      .then((response) => {
        const data = response.data?.results ?? []
        setUsers(Array.isArray(data) ? data : [])
        setTotalUsers(response.data?.count ?? 0)
        setError(null)
      })
      .catch((error) => {
        console.error("Error fetching users:", error)
        setError("Failed to load users")
        setUsers([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const getFilteredUsers = () => {
    let filtered = users
    
    if (filter === 'active') {
      filtered = filtered.filter(u => u.is_active && u.is_approved)
    } else if (filter === 'pending') {
      filtered = filtered.filter(u => !u.is_approved && u.is_active)
    } else if (filter === 'banned') {
      filtered = filtered.filter(u => !u.is_active)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
      )
    }
    
    return filtered
  }

  const getStatusText = (user: User) => {
    if (!user.is_active) return 'Banned'
    if (!user.is_approved) return 'Under Review'
    if (user.email_confirmed) return 'Active'
    return 'Inactive'
  }

  const getStatusColor = (user: User) => {
    if (!user.is_active) return '#ef4444'
    if (!user.is_approved) return '#f59e0b'
    if (user.email_confirmed) return '#22c55e'
    return '#6b7280'
  }

  // Maps each action to its endpoint and the optimistic local user patch to apply on success
  const ACTION_CONFIG: Record<PendingAction['action'], {
    endpoint: (id: number) => string
    needsReason: boolean
    confirmTitle: string
    confirmBody: (u: User) => string
    confirmLabel: string
    patch: Partial<User>
  }> = {
    approve: {
      endpoint: (id) => `/users/admin/users/${id}/approve/`,
      needsReason: false,
      confirmTitle: 'Approve user',
      confirmBody: (u) => `Approve ${u.first_name} ${u.last_name || ''} (${u.email})? They will gain full access and receive a confirmation email.`,
      confirmLabel: 'Approve',
      patch: { is_approved: true, is_active: true },
    },
    reject: {
      endpoint: (id) => `/users/admin/users/${id}/reject/`,
      needsReason: true,
      confirmTitle: 'Reject user',
      confirmBody: (u) => `Reject ${u.first_name} ${u.last_name || ''} (${u.email})? They will be notified by email.`,
      confirmLabel: 'Reject',
      patch: { is_approved: false, is_active: false },
    },
    ban: {
      endpoint: (id) => `/users/admin/users/${id}/ban/`,
      needsReason: true,
      confirmTitle: 'Suspend user',
      confirmBody: (u) => `Suspend ${u.first_name} ${u.last_name || ''} (${u.email})? They will lose access and be notified by email.`,
      confirmLabel: 'Suspend',
      patch: { is_active: false },
    },
    unban: {
      endpoint: (id) => `/users/admin/users/${id}/unban/`,
      needsReason: false,
      confirmTitle: 'Reactivate user',
      confirmBody: (u) => `Reactivate ${u.first_name} ${u.last_name || ''} (${u.email})? They will regain access and be notified by email.`,
      confirmLabel: 'Reactivate',
      patch: { is_active: true },
    },
  }

  const openConfirm = (user: User, action: PendingAction['action']) => {
    setActionError(null)
    setReason('')
    setPendingAction({ user, action })
  }

  const closeConfirm = () => {
    if (actionLoading) return // don't allow closing mid-request
    setPendingAction(null)
    setActionError(null)
    setReason('')
  }

  const confirmAction = () => {
    if (!pendingAction) return
    const { user, action } = pendingAction
    const config = ACTION_CONFIG[action]

    setActionLoading(true)
    setActionError(null)

    const body = config.needsReason ? { reason: reason.trim() || undefined } : undefined

    apiReq.post(config.endpoint(user.id), body)
      .then(() => {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...config.patch } : u))
        setPendingAction(null)
        setReason('')
      })
      .catch((err) => {
        console.error(`Error performing ${action} on user:`, err)
        setActionError(err?.response?.data?.error || 'Action failed. Please try again.')
      })
      .finally(() => {
        setActionLoading(false)
      })
  }

  const filteredUsers = getFilteredUsers()
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <main className="users_admin_main">
        <div className="loading-state">
          <span className="material-symbols-outlined spinning">refresh</span>
          <p>Loading users...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="users_admin_main">
        <div className="error-state">
          <span className="material-symbols-outlined">error</span>
          <p>Error: {error}</p>
          <button onClick={fetchUsers} className="retry-btn">Retry</button>
        </div>
      </main>
    )
  }

  return (
    <main className="users_admin_main">
      <h1>User Directory</h1>
      <p>Manage resort guests, verify memberships, and enforce community standards within the Alpine ecosystem.</p>

      <div className="filter_div">
        <div className="leftside_filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            ALL USERS
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
          >
            ACTIVE
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            UNDER REVIEW
          </button>
          <button 
            className={filter === 'banned' ? 'active' : ''} 
            onClick={() => setFilter('banned')}
          >
            BANNED
          </button>
        </div>

        <div className="leftside_exportcsv">
          <span className="material-symbols-outlined download">download</span>
          EXPORT CSV
        </div>
      </div>

      <div className="list_users">
        <div className="topdept">
          <p>User Profile</p>
          <p>Tenure</p>
          <p>Status</p>
          <p>Recent Activity</p>
          <p>Actions</p>
        </div>
        
        <div className="users_list">
          {currentUsers.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined">search_off</span>
              <p>No users found</p>
            </div>
          ) : (
            currentUsers.map((user) => (
              <div className="user_listel" key={user.id}>
                <div className="avatarimg">
                  <div className="img">
                    {user.avatar_url ?  
                      <img className="avataring" src={user.avatar_url} alt={user.first_name || user.email} />
                      :
                      <span className="material-symbols-outlined">person</span>
                    }
                  </div>
                  <div className="name">
                    <div className="user-name">
                      {user.first_name} {user.last_name || ''}
                      {user.company_profile && (
                        <span className="company-tag">
                          <span className="material-symbols-outlined">business</span>
                          {user.company_profile.company_name}
                        </span>
                      )}
                    </div>
                    <div className="user-email">{user.email}</div>
                    {user.phone && <div className="user-phone">{user.phone}</div>}
                  </div>
                </div>
                
                <div className="tenure">
                  <div className="join-date">
                    {user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'N/A'}
                  </div>
                  <div className="role-badge">
                    <span className="material-symbols-outlined">
                      {user.role === 'admin' ? 'admin_panel_settings' : 
                       user.role === 'company' ? 'business' :
                       user.role === 'reporter' ? 'assignment' : 'person'}
                    </span>
                    {user.role || 'User'}
                  </div>
                </div>
                
                <div className="status">
                  <span 
                    className="status-dot" 
                    style={{ backgroundColor: getStatusColor(user) }}
                  />
                  {getStatusText(user)}
                </div>
                
                <div className="recent">
                  {user.last_login ? 
                    new Date(user.last_login).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    }) : 'Never'
                  }
                </div>
                
                <div className="actions">
                 

                  {!user.is_approved && user.is_active && (
                    <>
                      <button
                        className="action-btn activate"
                        title="Approve User"
                        onClick={() => openConfirm(user, 'approve')}
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                      </button>
                      <button
                        className="action-btn suspend"
                        title="Reject User"
                        onClick={() => openConfirm(user, 'reject')}
                      >
                        <span className="material-symbols-outlined">cancel</span>
                      </button>
                    </>
                  )}

                  {user.is_active && user.is_approved && (
                    <button
                      className="action-btn suspend"
                      title="Suspend User"
                      onClick={() => openConfirm(user, 'ban')}
                    >
                      <span className="material-symbols-outlined">block</span>
                    </button>
                  )}

                  {!user.is_active && (
                    <button
                      className="action-btn activate"
                      title="Reactivate User"
                      onClick={() => openConfirm(user, 'unban')}
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bottom_pagination">
          <div className="button_page">
            <p>Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length}</p>
          </div>
          <div className="button_page">
            <button 
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <p>{currentPage} of {totalPages || 1}</p>
            <button 
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
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
              {ACTION_CONFIG[pendingAction.action].confirmBody(pendingAction.user)}
            </p>

            {ACTION_CONFIG[pendingAction.action].needsReason && (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (sent to the user)"
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
                  backgroundColor: pendingAction.action === 'ban' || pendingAction.action === 'reject' ? '#ef4444' : '#22c55e',
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