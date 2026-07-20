import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import TemperaturaIcon from '../../assets/Icons/TemperaturaIcon.png';
import VelocidadVientoIcon from '../../assets/Icons/VelocidadVientoIcon.png';
import RadianciaIcon from '../../assets/Icons/RadianciaIcon.png';

// Parche para íconos del marcador con Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CENIDET = [18.879620389097248, -99.22186407553191];

// Componente interno: llama invalidateSize() cuando cambia el contenedor
function MapResizer({ trigger }) {
    const map = useMap();
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), 220);
        return () => clearTimeout(t);
    }, [trigger, map]);
    return null;
}

const BARRA_ITEMS = [
    { key: 'temperatura', icon: TemperaturaIcon,      label: 'Temperatura',         campo: 'temperatura', unidad: '°C'   },
    { key: 'viento',      icon: VelocidadVientoIcon,  label: 'Velocidad del viento', campo: 'viento',      unidad: 'm/s'  },
    { key: 'radiacion',   icon: RadianciaIcon,         label: 'Radiancia',           campo: 'radiacion',   unidad: 'W/m²' },
];

function MapaInteractivo({ pantallaCompleta, onTogglePantallaCompleta, clima }) {
    const [iconoActivo, setIconoActivo] = useState(null);

    // Cierra la card flotante al salir de pantalla completa
    useEffect(() => {
        if (!pantallaCompleta) setIconoActivo(null);
    }, [pantallaCompleta]);

    const handleIcono = (key) => setIconoActivo(prev => prev === key ? null : key);

    const itemActivo = BARRA_ITEMS.find(i => i.key === iconoActivo);

    return (
        <>
            <MapContainer
                center={CENIDET}
                zoom={15}
                style={{ width: '100%', height: '100%' }}
                zoomControl
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">Leaflet</a> | © <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
                />
                <Marker position={CENIDET}>
                    <Popup>
                        <strong>Estación AW-SHEF · CENIDET</strong><br />
                        Apatzingan 6, Palmira<br />
                        62490 Cuernavaca, Mor., México
                    </Popup>
                </Marker>
                <MapResizer trigger={pantallaCompleta} />
            </MapContainer>

            {/* Botón de pantalla completa / salir */}
            <button
                className={`estacion-fullscreen-btn${pantallaCompleta ? ' estacion-fullscreen-btn--translucida' : ''}`}
                onClick={onTogglePantallaCompleta}
            >
                {pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
            </button>

            {/* Barra de íconos climáticos (solo en pantalla completa) */}
            {pantallaCompleta && (
                <div className="estacion-icon-bar">
                    {BARRA_ITEMS.map(item => (
                        <button
                            key={item.key}
                            className={`estacion-icon-bar__btn${iconoActivo === item.key ? ' estacion-icon-bar__btn--activo' : ''}`}
                            onClick={() => handleIcono(item.key)}
                            title={item.label}
                        >
                            <img src={item.icon} alt={item.label} className="estacion-icon-bar__icon" />
                        </button>
                    ))}
                </div>
            )}

            {/* Card flotante con el dato seleccionado */}
            {pantallaCompleta && iconoActivo && itemActivo && (
                <div className="estacion-floating-card" key={iconoActivo}>
                    <div className="estacion-floating-card__label">{itemActivo.label}</div>
                    <div className="estacion-floating-card__valor">
                        {clima?.[itemActivo.campo] != null
                            ? Number(clima[itemActivo.campo]).toFixed(1)
                            : '--'}
                        <span className="estacion-floating-card__unidad">{itemActivo.unidad}</span>
                    </div>
                </div>
            )}
        </>
    );
}

export default MapaInteractivo;
