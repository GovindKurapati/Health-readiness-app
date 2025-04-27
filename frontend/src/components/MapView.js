import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({ services, lat, lon }) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-medium text-gray-800 mb-2">
        Nearby Services
      </h3>
      <MapContainer
        center={[lat, lon]}
        zoom={12}
        className="h-96 rounded-lg shadow"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]}>
          <Popup>
            <span className="font-semibold">{"hospital"}</span>
          </Popup>
        </Marker>
        {services?.map((s, i) => (
          <Marker key={i} position={[s.latitude, s.longitude]}>
            <Popup>
              <span className="font-semibold">{s.name}</span>
              <br />
              {/* <span className="text-sm text-gray-600">Type: {s.type}</span> */}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
