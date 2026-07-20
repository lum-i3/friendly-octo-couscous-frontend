import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// IMPORTANTE: Debes importar el CSS de leaflet para que el mapa se vea bien
import 'leaflet/dist/leaflet.css';
// Arreglo para el icono (Leaflet a veces tiene problemas de rutas con React)
import L from 'leaflet';

// Esto es para que el icono del marcador aparezca correctamente
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapaSencillo = () => {
  // Coordenadas aproximadas (Latitud, Longitud)
  const posicionEstacion = [18.879620389097248, -99.22186407553191];

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <h2>Ubicación de la Estación Meteorológica</h2>
      <MapContainer 
        center={posicionEstacion} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* Este es el "diseño" del mapa*/}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* El marcador en el mapa */}
        <Marker position={posicionEstacion}>
          <Popup>
            <b>Estación WS-2902</b> <br /> 
            Monitoreando viento y radiación.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapaSencillo;