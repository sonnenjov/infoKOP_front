import { useOutletContext } from "react-router-dom"
import { Season } from "../../hooks/useSeason"
import "../../styles/partner/usluge_partner.css"
import { useState } from "react"
  interface OutletContext {
    companyAcc: {
      company_name: string
      address?: string
      email?: string
      role?: string
      phone?: string
      type?: string
      pib: string
    }
    activeSeason: Season
  }
   
const GlobalContentSwitchServices = () => {
  const [features, setFeatures] = useState({
    wifi: false,
    parking: false,
    spa: false,
    dining: false
  });

  const handleToggle = (feature) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const featuresList = [
    { id: 'wifi', icon: 'wifi', label: 'Wi-Fi', name: 'wifi_enabled' },
    { id: 'parking', icon: 'local_parking', label: 'Parking', name: 'parking_enabled' },
    { id: 'spa', icon: 'spa', label: 'Spa', name: 'spa_enabled' },
    { id: 'dining', icon: 'dining', label: 'Doručak', name: 'dining_enabled' }
  ];

  return (
    <>
        {featuresList.map((feature) => (
          <div key={feature.id}>
            <span className="material-symbols-outlined">{feature.icon}</span>
            {feature.label}
            <div className="custom-checkbox-partner">
              <input 
                id={feature.id} 
                type="checkbox" 
                name={feature.name}
                checked={features[feature.id]}
                onChange={() => handleToggle(feature.id)}
                />
              <label htmlFor={feature.id}>
                <div className="status-switch"
                  data-unchecked="Off"
                  data-checked="On">
                </div>
              </label>
            </div>
          </div>
        ))}
      </>
  );
};


export default function PartnerUsluge()  {
  

  const { companyAcc } = useOutletContext<OutletContext>()
  return (
    <main className="usluge_partner">
      <div className="inner_grid_usluge">
          <div 
          style={{gridArea:"u1"}}
          className="uslugebox1 boxi1">
            <div className="uslugebox1_layout">
              <div className="gradient"></div>
            </div>
            <div className="uslugebox1_content">
              
            <p className="highlight">
                Service Management
            </p>
            <h1>Experience inventory</h1>
            <p className="infoservice">
              Curate and manage your resort's world-class offerings, from spa treatments to exclusive mountain dining.
            </p>
            </div>
          </div>
          <div 
          style={{gridArea:"u2"}}
          className="uslugebox2 boxi1">
            <div className="component">
              <div className="gornji">
                <div className="gornji_left">
                      <span className="material-symbols-outlined">spa</span>
                      <div className="text">
                        <h5>Glacier Peak Facial</h5>
                        <p>Category: {'kategorija'}</p>
                      </div>
                </div>
                <div className="gornji_right">
                      <input type="checkbox" />

                </div>
              </div>
              <hr className="component_separator" />
              <div className="donji">
                <div className="donji_left">
                    <p>{"valuta"} cena</p>
                </div>
                <div className="donji_right">
                    <span 
                    style={{cursor:"pointer"}}
                    className="material-symbols-outlined">spa</span>
                    <span 
                    style={{cursor:"pointer"}}
                    className="material-symbols-outlined">more_vert</span>
                </div>
              </div>
            </div>
            <div className="add_component">
              <span className="material-symbols-outlined">
                add
              </span>
              Add New item
            </div>
          </div>
        
      </div>
    </main>
  )
} 