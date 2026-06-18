import { useState, useEffect } from "react"
import { apiReq } from "../hooks/api"
import "../styles/company_filter.css"
import { useNavigate } from "react-router-dom"

interface Company {
  id: number
  company_name: string
  type: string
  address: string
  pib: string
  slug: string
  logo?: string
  cover_photo?: string
}

interface CompanyFilterProps {
  activeSeason: string
  onCompanySelect: (company: Company | null) => void
  filterType?: 'all' | 'smestaj' | 'ugostitelji' | 'dogadjaji'
}

export default function CompanyFilter({ activeSeason, onCompanySelect, filterType = 'all' }: CompanyFilterProps) {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  const companyTypeMap: Record<string, string[]> = {
    smestaj: ['hotel', 'apartman', 'vila'],
    ugostitelji: ['restoran', 'kafic', 'apres_ski'],
    dogadjaji: ['organizator'],
    all: ['hotel', 'apartman', 'vila', 'restoran', 'kafic', 'apres_ski', 'aktivnost', 'ski_skola', 'organizator', 'servis_iznajmljivanje', 'prevoz']
  }

  useEffect(() => {
    fetchCompanies()
  }, [filterType])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const response = await apiReq.get('/users/all/companies/')

      let data = response.data
      let companiesData: Company[] = []
      if (response.status === 401) {
       navigate('account/login');  
}
      if (data?.results) {
        companiesData = data.results
      } else if (Array.isArray(data)) {
        companiesData = data
      }

      const allowedTypes = companyTypeMap[filterType] || companyTypeMap.all
      const filteredCompanies = companiesData.filter((company: Company) =>
        allowedTypes.includes(company.type)
      )

      setCompanies(filteredCompanies)
    } catch (error) {
      console.error("Error fetching companies:", error)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company =>
    company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`company-filter ${activeSeason}`}>
      <div className="company-filter-header">
        <span className="material-symbols-outlined">storefront</span>
        <p>Partner</p>
      </div>

      <div className="company-search-wrapper">
        <input
          type="text"
          placeholder="Pretraga partnera..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className="company-search-input"
        />

        {showDropdown && (
          <div className="company-dropdown">
            {loading ? (
              <div className="company-dropdown-item loading">Učitavanje...</div>
            ) : filteredCompanies.length > 0 ? (
              <>
                <div
                  className="company-dropdown-item all"
                  onMouseDown={() => {
                    setSelectedCompany(null)
                    onCompanySelect(null)
                    setSearchTerm("")
                    setShowDropdown(false)
                  }}
                >
                  <span className="material-symbols-outlined">clear</span>
                  Svi partneri
                </div>
                {filteredCompanies.map(company => (
                  <div
                    key={company.id}
                    className="company-dropdown-item"
                    onMouseDown={() => {
                      setSelectedCompany(company)
                      onCompanySelect(company)
                      setSearchTerm(company.company_name)
                      setShowDropdown(false)
                    }}
                  >
                    {company.logo ? (
                      <img src={company.logo} alt={company.company_name} className="company-logo-small" />
                    ) : (
                      <span className="material-symbols-outlined">business</span>
                    )}
                    <div>
                      <div className="company-name">{company.company_name || 'Bez naziva'}</div>
                      <div className="company-type">{company.type || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="company-dropdown-item">Nema pronađenih partnera</div>
            )}
          </div>
        )}
      </div>

      {selectedCompany && (
        <div className="selected-company">
          <div className="selected-company-info">
            {selectedCompany.logo ? (
              <img src={selectedCompany.logo} alt={selectedCompany.company_name} className="company-logo-small" />
            ) : (
              <span className="material-symbols-outlined">business</span>
            )}
            <div>
              <div className="company-name">{selectedCompany.company_name}</div>
              <div className="company-type">{selectedCompany.type}</div>
            </div>
          </div>
          <button
            className="clear-company"
            onClick={() => {
              setSelectedCompany(null)
              onCompanySelect(null)
              setSearchTerm("")
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
    </div>
  )
}