import { useState, useEffect, useCallback, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useParams, useNavigate } from "react-router-dom"
import "../../styles/reporter/newsedit_reporter.css"
import { apiReq } from "../../hooks/api"

type Status = "nacrt" | "objavljeno" | "zakazano"
type Priority = "nizak" | "srednji" | "visok"
type Theme = "sve" | "infrastruktura" | "vremenska prognoza" | "sport" | "aktivnosti" | "dogadjaji"

const THEME_LABELS: Record<Theme, string> = {
  sve: "Sve",
  infrastruktura: "Infrastruktura",
  "vremenska prognoza": "Vremenska prognoza",
  sport: "Sport",
  aktivnosti: "Aktivnosti",
  dogadjaji: "Događaji",
}

const PRIORITY_LABELS: Record<Priority, string> = {
  nizak: "Nizak",
  srednji: "Srednji",
  visok: "Visok",
}

const STATUS_LABELS: Record<Status, string> = {
  nacrt: "Nacrt",
  objavljeno: "Objavljeno",
  zakazano: "Zakazano",
}

interface TagBackend {
  id: number
  name: string
}

interface ToolBtnProps {
  onClick: () => void
  active?: boolean
  icon?: string
  label?: string
}

const ToolBtn = ({ onClick, active, icon, label }: ToolBtnProps) => (
  <button
    className={`vest-editor__tool-btn${active ? " vest-editor__tool-btn--active" : ""}`}
    onClick={onClick}
    type="button"
  >
    {icon ? <span className="material-symbols-outlined">{icon}</span> : label}
  </button>
)

export default function ReporterEditNews() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id
  const coverRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [theme, setTheme] = useState<Theme>("sve")
  const [status, setStatus] = useState<Status>("nacrt")
  const [priority, setPriority] = useState<Priority>("srednji")
  const [isVisible, setIsVisible] = useState(false)
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDesc, setSeoDesc] = useState("")
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [availableTags, setAvailableTags] = useState<TagBackend[]>([])
  const [newTagInput, setNewTagInput] = useState("")

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [viewsCount, setViewsCount] = useState("—")
  const [authorName, setAuthorName] = useState("Vi")
  const [fetchedText, setFetchedText] = useState<string | null>(null)

const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Počnite pisati vest..." }),
    ],
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
    },
})

useEffect(() => { if (editor && fetchedText) {
      editor.commands.setContent(fetchedText)
    }
}, [editor, fetchedText]);



useEffect(() => {

    const fetchData = async () => {
      try {
        try {
          const tagsRes = await apiReq.get("tags/")
          const tagsData = Array.isArray(tagsRes.data) ? tagsRes.data : 
            (tagsRes.data.results && Array.isArray(tagsRes.data.results) ? tagsRes.data.results : [])
          setAvailableTags(tagsData)
        } catch (tagsErr) {
          console.warn("Tags endpoint not available yet, using empty list", tagsErr)
          setAvailableTags([])
        }

        if (!isNew) {
          const newsRes = await apiReq.get(`news/${id}/edit/`)
          const article = newsRes.data

          setTitle(article.title || "")
          setTheme(article.theme || "sve")
          setStatus(article.status || "nacrt")
          setPriority(article.priority || "srednji")
          setIsVisible(article.is_visible || false)
          setSeoTitle(article.seo_title || "")
          setSeoDesc(article.seo_desc || "")
          setCoverUrl(article.image || null)
          setViewsCount(article.views_count ? article.views_count.toLocaleString() : "—")
          setAuthorName(article.author || "Nepoznat")
          
          const articleTags = Array.isArray(article.tags) ? article.tags : []
          setSelectedTagIds(articleTags)
          
          setFetchedText(article.text || "")
        }
      } catch (err) {
        console.error("Initialization failed", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, isNew])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverUrl(URL.createObjectURL(file))
  }

  useEffect(() => {
    if (!seoTitle && title) {
      const timeoutId = setTimeout(() => setSeoTitle(title.slice(0, 60)), 300)
      return () => clearTimeout(timeoutId)
    }
  }, [title, seoTitle])

const doSave = useCallback(async (isPublishTrigger = false) => {
  if (!title && !editor?.getText()) return
  setSaving(true)
  
  try {
    const formData = new FormData()
    
    formData.append("title", title)
    formData.append("text", editor?.getHTML() ?? "")
    formData.append("theme", theme)
    formData.append("priority", priority)
    formData.append("status", isPublishTrigger ? "objavljeno" : status)
    formData.append("is_visible", String(isPublishTrigger ? true : isVisible))
    formData.append("seo_title", seoTitle)
    formData.append("seo_desc", seoDesc)
    
    formData.append("tags", JSON.stringify(selectedTagIds))
    if (coverFile) {
      formData.append("image", coverFile)
    }
    



    const url = isNew ? "news/create/" : `news/${id}/edit/`
    const method = isNew ? "POST" : "PATCH"
    
    const response = await apiReq({
      method,
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
    

    console.log("=== SAVE RESPONSE ===")
console.log("Response status:", response.status)
console.log("Response data:", response.data)
console.log("Image in response:", response.data?.image)
console.log("===================")


    setLastSaved(new Date())
    
    if (isPublishTrigger) {
      setStatus("objavljeno")
      setIsVisible(true)
    }
    
    if (isNew && response.data?.id) {
      navigate(`/reporter/vesti`, { replace: true })
    }
  } catch (err) {
    console.error("Save execution failed", err)
  } finally {
    setSaving(false)
  }
}, [title, editor, theme, status, priority, isVisible, seoTitle, seoDesc, selectedTagIds, coverFile, isNew, id, navigate])
  useEffect(() => {
    const autoSaveId = setInterval(() => doSave(false), 30000)
    return () => clearInterval(autoSaveId)
  }, [doSave])

  const handleCreateAndAddTag = async () => {
    const tagName = newTagInput.trim()
    if (!tagName) return

    const match = availableTags.find(t => t.name.toLowerCase() === tagName.toLowerCase())
    if (match) {
      if (!selectedTagIds.includes(match.id)) {
        setSelectedTagIds(prev => [...prev, match.id])
      }
      setNewTagInput("")
      return
    }

    try {
      const res = await apiReq.post("tags/create/", { name: tagName })
      setAvailableTags(prev => [...prev, res.data])
      setSelectedTagIds(prev => [...prev, res.data.id])
      setNewTagInput("")
    } catch (err) {
      console.error("Failed creating tag via API, using local tag", err)
      const tempTag = { id: Date.now(), name: tagName }
      setAvailableTags(prev => [...prev, tempTag])
      setSelectedTagIds(prev => [...prev, tempTag.id])
      setNewTagInput("")
    }
  }

  const toggleTagSelection = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const formatTime = (d: Date | null) =>
    d ? `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}` : null

  if (loading) {
    return <div className="vest-editor-loading">Učitavanje podataka vesti...</div>
  }


  const handleDelete = async () => {
  if (!id) return
  if (!window.confirm('Da li ste sigurni da želite da obrišete ovu vest?')) return
  
  try {
    await apiReq.delete(`news/${id}/delete/`)
    navigate('/reporter/vesti', { replace: true })
  } catch (err) {
    console.error('Delete failed', err)
  }
}

  return (
    <div className="vest-editor">
      <header className="vest-editor__topbar">
        <div className="vest-editor__topbar-left">
          <h1 className="vest-editor__page-title">
            {isNew ? "Nova vest" : "Uredi vest"}
          </h1>
          <span className={`vest-editor__status-badge vest-editor__status-badge--${status}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>

        <div className="vest-editor__topbar-right">
          <div className="vest-editor__autosave">
            <div className={`vest-editor__autosave-dot${saving ? " vest-editor__autosave-dot--saving" : ""}`} />
            {saving ? "Čuvanje..." : lastSaved ? `Sačuvano u ${formatTime(lastSaved)}` : "Nije sačuvano"}
          </div>
          <button className="vest-editor__btn-discard" onClick={() => navigate(-1)}>
            Odbaci
          </button>
          <button className="vest-editor__btn-save" onClick={() => doSave(false)}>
            <span className="material-symbols-outlined" style={{ fontSize: "1em" }}>save</span>
            Sačuvaj
          </button>
          <button className="vest-editor__btn-publish" onClick={() => doSave(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: "1em" }}>publish</span>
            Objavi
          </button>
          {!isNew && (
            <button 
              className="vest-editor__btn-delete" 
              onClick={handleDelete}
              type="button"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1em" }}>delete</span>
              Obriši
            </button>
          )}
          <button className="vest-editor__btn-discard" onClick={() => navigate(-1)}>
            Odbaci
          </button>
        </div>
      </header>

      <div className="vest-editor__body">
        <div className="vest-editor__main">
          <div className="vest-editor__cover" onClick={() => coverRef.current?.click()}>
            {coverUrl ? (
              <img src={coverUrl} alt="Cover" className="vest-editor__cover-img" />
            ) : (
              <div className="vest-editor__cover-placeholder">
                <span className="material-symbols-outlined">photo_camera</span>
                <p style={{ fontSize: "0.75em", opacity: 0.5 }}>Dodaj naslovnu sliku</p>
                <p style={{ fontSize: "0.75em", opacity: 0.5 }}>Upload direktno na Cloudinary</p>
              </div>
            )}
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              style={{ display: "none" }}
            />
            <button className="vest-editor__cover-btn" type="button">
              <span className="material-symbols-outlined">upload</span>
              {coverUrl ? "Promeni sliku" : "Upload sliku"}
            </button>
            
          </div>

          <input
            className="vest-editor__title-input"
            placeholder="Unesite naslov vesti..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <div className="vest-editor__toolbar">
            <ToolBtn
              onClick={() => editor?.chain().focus().toggleBold().run()}
              active={editor?.isActive("bold")}
              icon="format_bold"
            />
            <ToolBtn
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              active={editor?.isActive("italic")}
              icon="format_italic"
            />
            <ToolBtn
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor?.isActive("heading", { level: 2 })}
              label="H2"
            />
            <ToolBtn
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor?.isActive("heading", { level: 3 })}
              label="H3"
            />
            <ToolBtn
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              active={editor?.isActive("bulletList")}
              icon="format_list_bulleted"
            />
            <span className="vest-editor__word-count">{wordCount} reči</span>
          </div>

          <EditorContent editor={editor} className="vest-editor__content" />

          <div className="vest-editor__seo">
            <h3>SEO Optimizacija</h3>
            
            <label>SEO Naslov (Maksimalno 70 karaktera)</label>
            <input
              type="text"
              maxLength={70}
              value={seoTitle}
              onChange={e => setSeoTitle(e.target.value)}
              placeholder="Unesite pretraživački naslov..."
            />

            <label>SEO Opis (Maksimalno 160 karaktera)</label>
            <textarea
              maxLength={160}
              rows={3}
              value={seoDesc}
              onChange={e => setSeoDesc(e.target.value)}
              placeholder="Unesite kratak rezime za Google pretragu..."
            />
          </div>

          <div className="vest-editor__meta">
            <h3>Metapodaci</h3>
            <div>Autor: {authorName}</div>
            <div>Pregledi: {viewsCount}</div>
          </div>
        </div>

        <aside className="vest-editor__sidebar">
          <div className="vest-editor__field">
            <label>Status Vesti</label>
            <select value={status} onChange={e => setStatus(e.target.value as Status)}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <span className="vest-editor__hint">
              {status === "nacrt" && "Samo vi možete videti ovu vest"}
              {status === "objavljeno" && "Vest je javno dostupna"}
              {status === "zakazano" && "Vest će biti objavljena u zakazano vreme"}
            </span>
          </div>

          <div className="vest-editor__field">
            <label>Kategorizacija (Tema)</label>
            <select value={theme} onChange={e => setTheme(e.target.value as Theme)}>
              {Object.entries(THEME_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="vest-editor__field">
            <label>Prioritet Prikaza</label>
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="vest-editor__field vest-editor__field--checkbox">
            <label>
              <input
                type="checkbox"
                checked={isVisible}
                onChange={e => setIsVisible(e.target.checked)}
              />
              Vidljivost na Sajtu
            </label>
            <span className="vest-editor__hint">Prikaži vest javno</span>
          </div>

          <div className="vest-editor__field">
            <label>Tagovi vesti</label>
            <div className="vest-editor__tag-input">
              <input
                type="text"
                value={newTagInput}
                onChange={e => setNewTagInput(e.target.value)}
                placeholder="Dodaj novi tag..."
                onKeyPress={e => e.key === 'Enter' && handleCreateAndAddTag()}
              />
              <button onClick={handleCreateAndAddTag} type="button">Dodaj</button>
            </div>
            <div className="vest-editor__tags">
              {Array.isArray(availableTags) && availableTags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id)
                return (
                  <span
                    key={tag.id}
                    onClick={() => toggleTagSelection(tag.id)}
                    className={`vest-editor__tag-pill ${isSelected ? "vest-editor__tag-pill--active" : ""}`}
                  >
                    {tag.name}
                  </span>
                )
              })}
            </div>
            {availableTags.length === 0 && (
              <p style={{ fontSize: "0.7em", color: "#4a5c4a", marginTop: "0.5em" }}>
                Tags will be available once the backend endpoint is created
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}