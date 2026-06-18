import "../../styles/admin/settings_admin.css"
import AdminAPI from "./settings/AdminAPI"
import AdminBilling from "./settings/AdminBilling"
import AdminGeneral from "./settings/AdminGeneral"
import AdminNotif from "./settings/AdminNotif"
import AdminSecurity from "./settings/AdminSecurity"
import { useState } from "react"
const list = [
  { name: 'General', 
    element: <AdminGeneral/>,
    text: "Core identity and operational parameters for the InfoKOP platform."
  },
   { name: 'Security', 
    element: <AdminSecurity/>,
    text: "Encryption, access control, and administrative audit trails."
  },
   { name: 'Notifications', 
    element: <AdminNotif/>,
    text: "Global alert routing for system and partner events."
  },
   { name: 'Billing', 
    element: <AdminBilling/>,
    text: "Monetization, payouts, and financial reporting configuration."
  },
   { name: 'Api & Integration', 
    element: <AdminAPI/>,
    text: "Connect third-party services and manage developer access keys."
  },
]

export default function AdminSettings() {
  const [active, setActive] = useState(list[0].name)
  const current = list.find((e) => e.name === active)!
  return (
    <main className="settings_admin">
      <div className="toptexting">
      <h1>Portal Configuration</h1>
      <p>Manage your mountain resort ecosystem settings, from global branding and localized content to critical security protocols.</p>
      </div>
      <div className="depart">
        {list.map((e) => {
          return (
            <p 
             key={e.name}
            className={`${e.name} ${active === e.name ? "active" : ""}`}
            onClick={() => setActive(e.name)}>
              {e.name}
            </p>
          )
        })}
        </div>
        <div className="mainpart">
        <div style={{ gridArea: "left" }} className="leftsidepart">
          <h1>{current.name}</h1>
          <p>{current.text}</p>
        </div>
        <hr className="vertical" />
        <div style={{ gridArea: "right" }} className="rightsidepart">
          {current.element}
        </div>
      </div>
      <div className="dangerzoner">
        <div style={{ gridArea: "left" }} className="leftsidepart">
          <h1>Danger Zone</h1>
          <p>High-impact actions that affect system availability and data integrity.</p>
        </div>
        <div style={{ gridArea: "right" }} className="rightsidepart">
          <div className="dangerelem"> 

          </div>
        </div>
      </div>

      <div className="save_discard">
        <button>DISCARD CHANGES</button>
        <button>SAVE CHANGES</button>
      </div>
    </main>
  )
}