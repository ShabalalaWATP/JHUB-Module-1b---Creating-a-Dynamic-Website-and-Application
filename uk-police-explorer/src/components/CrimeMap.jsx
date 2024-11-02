// src/components/CrimeMap.jsx
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon issues with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function CrimeMap({ boundaryData, crimeData, darkMode }) {
  // Convert boundaryData to an array of [lat, lng] pairs
  const boundaryLatLngs = boundaryData.map(point => [point.latitude, point.longitude]);

  // Calculate the center of the boundary to center the map
  const center = boundaryLatLngs.reduce(
    (acc, [lat, lng]) => [acc[0] + parseFloat(lat), acc[1] + parseFloat(lng)],
    [0, 0]
  ).map(coord => coord / boundaryLatLngs.length);

  return (
    <div className="h-[500px] w-full">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url={
            darkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
          attribution={
            darkMode
              ? '&copy; OpenStreetMap contributors &copy; CartoDB'
              : '&copy; OpenStreetMap contributors'
          }
        />
        {/* Draw the neighbourhood boundary */}
        <Polygon positions={boundaryLatLngs} color="blue" />
        {/* Plot crime locations */}
        {crimeData.map((crime, index) => (
          <Marker
            key={index}
            position={[crime.location.latitude, crime.location.longitude]}
          >
            <Popup>
              <strong>{crime.category.replace(/-/g, ' ').toUpperCase()}</strong>
              <br />
              {crime.location.street.name}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
