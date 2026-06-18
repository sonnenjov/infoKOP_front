import { useState } from "react";
import "../../styles/partner/smestaj_partner.css";

// GlobalContentSwitch komponenta
const GlobalContentSwitch = () => {
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
    <div className="pristupi smestajbox">
      <div className="title">
        Globalni Sadržaji
      </div>
      <div className="prist">
        {featuresList.map((feature) => (
          <p key={feature.id}>
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
          </p>
        ))}
      </div>
    </div>
  );
};

// Glavna PartnerSmestaj komponenta
export default function PartnerSmestaj() {
  return (
    <main className="smestaj_partner">
      <div className="inner_grid_smestaj">
        <div 
          style={{gridArea:"s1"}}
          className="topshelf smestajbox"
        >
          <h5>Upravljanje smestajem</h5>
          <div className="addunit">
            <span className="material-symbols-outlined">add</span>
            Dodaj Novu jedinicu
          </div>
        </div>
        
        <div 
          style={{gridArea:"s2"}}
          className="jedinice smestajbox"
        >
          <div className="unit1">
            <h4 className="title">UKUPNO JEDINICA</h4>
            <div className="unit_part">
              <p>0</p>
              <span className="material-symbols-outlined">apartment</span>
            </div>
          </div>
          <div className="unit2">
            <h4 className="title">AKTIVNE REZERVACIJE</h4>
            <div className="unit_part">
              <p>0</p>
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
          </div>
          <div className="unit3">
            <h4 className="title">POPUNJENOST (MESEČNO)</h4>
            <div className="unit_part">
              <p>0%</p>
              <span className="material-symbols-outlined">android_cell_4_bar</span>
            </div>
          </div>
        </div>
        
        <div 
          style={{gridArea:"s3"}}
          className="lista_smestaja smestajbox"
        >
          <div className="title">
            LISTA SMESTAJNIH JEDINICA
          </div>
          <div className="listasmestaja">
            <p>Naziv jedinice</p>
            <p>Kapacitet</p>
            <p>Cena/Noć</p>
            <p>Status</p>
            <p>Akcije</p>
          </div>
        </div>
        
        <div style={{ gridArea: "s4" }}>
          <GlobalContentSwitch />
        </div>
        
        <div 
          style={{gridArea:"s5"}}
          className="formiranjecena smestajbox"
        >
          <div className="title">
            <span className="material-symbols-outlined">payments</span>
            <p>Sezonsko formiranje cena</p>
          </div>
          <div className="letnja">
            <div className="leva">
              <p>Letnja sezona</p>
              <p>Jun - Avg</p>
            </div>
            <div className="desna">
              <p>0%</p>
              <input type="checkbox" />
            </div>
          </div>
          <div className="zimska">
            <div className="leva">
              <p>Zimska sezona</p>
              <p>Dec - Mar</p>
            </div>
            <div className="desna">
              <p>0%</p>
              <input type="checkbox" />
            </div>
          </div>
          <button>UPRAVLJAJ PERIODIMA</button>
        </div>
        
        <div 
          style={{gridArea:"s6"}}
          className="uvid smestajbox"
        >
          <div className="title">BRZI UVID</div>
          <div className="uvid-content">
            <p>Ukupno jedinica: 0</p>
            <p>Aktivne rezervacije: 0</p>
            <p>Popunjenost: 0%</p>
          </div>
        </div>
      </div>
    </main>
  );
}