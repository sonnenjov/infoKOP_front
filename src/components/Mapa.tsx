import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Mapa() {
  return (
    <div className="map-wrapper">
      <MapContainer
        center={[43.285, 20.81]}
        zoom={13}
        className="leaflet-map"
      >
       <TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
      </MapContainer>

      <div className="topo-overlay" />
    </div>
  );
}