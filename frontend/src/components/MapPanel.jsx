import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* Fix marker icons */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* Click handler */
function ClickHandler({ setLocation, setAddress }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setLocation({ lat, lng });

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`
        );
        const data = await res.json();

        const a = data.address || {};
        const label =
          a.suburb ||
          a.neighbourhood ||
          a.city_district ||
          a.county ||
          a.city ||
          data.display_name;

        setAddress(label || "Beijing area");
      } catch {
        setAddress("Beijing area");
      }
    },
  });

  return null;
}

export default function MapPanel({ location, setLocation, setAddress }) {
  const center = location || { lat: 39.9042, lng: 116.4074 };

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution="© OpenStreetMap, © CartoDB"
      />

      <ZoomControl position="bottomright" />

      <ClickHandler
        setLocation={setLocation}
        setAddress={setAddress}
      />

      {location && <Marker position={location} />}
    </MapContainer>
  );
}
