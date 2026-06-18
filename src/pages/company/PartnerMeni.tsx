// PartnerMeni.tsx
import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { apiReq } from "../../hooks/api"
import { Season } from "../../hooks/useSeason"
import "../../styles/partner/meni_partner.css"

interface OutletContext {
  companyAcc: { 
    company_name: string
    type?: string
    cover_photo?: string  // ADD THIS
    logo?: string         // ADD THIS
  }
  activeSeason: Season
}

interface Category { id: number; name: string }
interface MenuItem {
  id: number
  name: string
  description: string
  price: string        
  category: number | null
  category_name: string | null
  is_available: boolean
  allergens: string[]
}

const ALLERGEN_ICONS: Record<string, string> = {
  gluten: "grain", mleko: "water_drop", jaja: "egg", orasi: "forest",
}

export default function PartnerMeni() {
  const { companyAcc } = useOutletContext<OutletContext>()

  const [items,      setItems]      = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab,  setActiveTab]  = useState<number | "all">("all")
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [editItem,   setEditItem]   = useState<MenuItem | null>(null)
  const [saving,     setSaving]     = useState(false)
  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "" as string | number, allergens: [] as string[],
  })

  useEffect(() => {
    Promise.all([
      apiReq.get("/ugostitelji/menu/"),
      apiReq.get("/ugostitelji/categories/"),
    ]).then(([itemsRes, catsRes]) => {
      setItems(itemsRes.data)
      setCategories(catsRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = activeTab === "all"
    ? items
    : items.filter(i => i.category === activeTab)

  const totalItems  = items.length
  const activeItems = items.filter(i => i.is_available).length
  const outOfStock  = items.filter(i => !i.is_available).length

  const openNew = () => {
    setEditItem(null)
    setForm({ name: "", description: "", price: "", category: categories[0]?.id ?? "", allergens: [] })
    setShowModal(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditItem(item)
    setForm({
      name: item.name, description: item.description,
      price: item.price, category: item.category ?? "",
      allergens: item.allergens,
    })
    setShowModal(true)
  }

  const saveItem = async () => {
    if (!form.name || !form.price) return
    setSaving(true)
    const payload = {
      name: form.name, description: form.description,
      price: form.price, category: form.category || null,
      allergens: form.allergens,
    }
    try {
      if (editItem) {
        const res = await apiReq.patch(`/ugostitelji/menu/${editItem.id}/`, payload)
        setItems(prev => prev.map(i => i.id === editItem.id ? res.data : i))
      } else {
        const res = await apiReq.post("/ugostitelji/menu/", payload)
        setItems(prev => [...prev, res.data])
      }
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (id: number) => {
    await apiReq.delete(`/ugostitelji/menu/${id}/`)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const toggleAvailable = async (id: number) => {
    const res = await apiReq.patch(`/ugostitelji/menu/${id}/toggle/`)
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_available: res.data.is_available } : i))
}

  const toggleAllergen = (a: string) => {
    setForm(f => ({
      ...f,
      allergens: f.allergens.includes(a) ? f.allergens.filter(x => x !== a) : [...f.allergens, a],
    }))
  }

  if (loading) return (
    <main className="meni_company">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <span className="material-symbols-outlined" style={{ color: "var(--weather-inactive-summer)", fontSize: "2rem" }}>
          hourglass_top
        </span>
      </div>
    </main>
  )

  return (
    <main className="meni_company">
      <div className="grid_meni_company">

        {/* UPDATED: Header with cover photo */}
        <div style={{ gridArea: "m1" }} className="meni_header boxa">
          <div 
            className="meni_header_bg" 
            style={{ 
              backgroundImage: companyAcc?.cover_photo ? `url(${companyAcc.cover_photo})` : undefined 
            }}
          />
          <div className="meni_header_content">
            <div className="partnerdiv">UPRAVLJANJE MENIJEM</div>
            <h1>{companyAcc?.company_name}</h1>
            <p>Upravljajte artiklima, cenama i dostupnošću.</p>
          </div>
          <button className="novi_artikal_btn" onClick={openNew}>
            <span className="material-symbols-outlined">add_circle</span>
            Novi Artikal
          </button>
        </div>

        <div style={{ gridArea: "m2" }} className="meni_stats boxa">
          <div className="mstat">
            <div className="mstat_top">
              <span className="material-symbols-outlined">restaurant_menu</span>
              UKUPNO
            </div>
            <div className="mstat_bottom">ARTIKALA<p>{totalItems}</p></div>
          </div>
          <div className="mstat mstat_active">
            <div className="mstat_top">
              <span className="material-symbols-outlined">check_circle</span>
              AKTIVNO
            </div>
            <div className="mstat_bottom">DOSTUPNO<p>{activeItems}</p></div>
          </div>
          <div className="mstat mstat_out">
            <div className="mstat_top">
              <span className="material-symbols-outlined">cancel</span>
              NEMA
            </div>
            <div className="mstat_bottom">NA STANJU<p>{outOfStock}</p></div>
          </div>
        </div>

        <div style={{ gridArea: "m3" }} className="meni_lista boxa">
          <div className="meni_tabs">
            <button
              className={`meni_tab${activeTab === "all" ? " active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              Sve
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`meni_tab${activeTab === cat.id ? " active" : ""}`}
                onClick={() => setActiveTab(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="meni_row meni_row_header">
            <span>ARTIKAL I OPIS</span>
            <span>ALERGENI</span>
            <span>CENA</span>
            <span>DOSTUPNO</span>
            <span>AKCIJE</span>
          </div>

          <div className="meni_items">
            {filtered.length === 0 && (
              <div className="meni_empty">
                <span className="material-symbols-outlined">restaurant</span>
                <p>Nema artikala u ovoj kategoriji.</p>
                <button onClick={openNew}>Dodaj prvi artikal</button>
              </div>
            )}
            {filtered.map(item => (
              <div key={item.id} className="meni_row meni_row_item">
                <div className="meni_item_info">
                  <div className="meni_item_img">
                    <span className="material-symbols-outlined">restaurant</span>
                  </div>
                  <div>
                    <p className="meni_item_name">{item.name}</p>
                    <p className="meni_item_desc">{item.description}</p>
                  </div>
                </div>
                <div className="meni_allergens">
                  {item.allergens.slice(0, 3).map(a => (
                    <span key={a} className="material-symbols-outlined allergen_icon" title={a}>
                      {ALLERGEN_ICONS[a] ?? "warning"}
                    </span>
                  ))}
                </div>
                <span className="meni_price">
                  {Number(item.price).toLocaleString("sr-RS")} RSD
                </span>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={item.is_available}
                    onChange={() => toggleAvailable(item.id)}
                  />
                  <span className="toggle_slider" />
                </label>
                <div className="meni_actions">
                  <button className="action_btn" onClick={() => openEdit(item)}>
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="action_btn action_delete" onClick={() => deleteItem(item.id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="meni_modal_overlay" onClick={() => setShowModal(false)}>
          <div className="meni_modal" onClick={e => e.stopPropagation()}>
            <div className="meni_modal_header">
              <h2>{editItem ? "Uredi Artikal" : "Novi Artikal"}</h2>
              <button onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="meni_modal_body">
              <label>Naziv</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Naziv artikla"
              />
              <label>Opis</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Kratki opis"
              />
              <label>Cena (RSD)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0"
              />
              <label>Kategorija</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: Number(e.target.value) }))}
              >
                <option value="">— bez kategorije —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label>Alergeni</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["gluten", "mleko", "jaja", "orasi"].map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAllergen(a)}
                    style={{
                      padding: "0.3em 0.7em",
                      borderRadius: "20px",
                      border: "1px solid",
                      cursor: "pointer",
                      fontFamily: "JetBrain Mono",
                      fontSize: "0.75rem",
                      background: form.allergens.includes(a) ? "var(--weather-inactive-summer)" : "transparent",
                      color: form.allergens.includes(a) ? "var(--weather-active-summer)" : "#888",
                      borderColor: form.allergens.includes(a) ? "var(--weather-inactive-summer)" : "#444",
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="meni_modal_footer">
              <button className="btn_cancel" onClick={() => setShowModal(false)}>Otkaži</button>
              <button className="btn_save" onClick={saveItem} disabled={saving}>
                {saving ? "..." : editItem ? "Sačuvaj" : "Dodaj"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}