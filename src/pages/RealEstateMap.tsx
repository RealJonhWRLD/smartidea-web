import { useState, useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
    Box, Paper, Button, TextField, IconButton, Autocomplete, InputAdornment,
    ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
    MyLocation as MyLocationIcon,
    Search as SearchIcon,
    Place as PlaceIcon,
    Home as HomeIcon,
    AddLocationAlt as AddLocationIcon, // Ícone para cadastro no clique
    Add as AddIcon,
    Remove as RemoveIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MAP_DEFAULTS } from '../utils/mapConfig';
import api from '../services/api';

// 👇 IMPORTA OS COMPONENTES
import { PropertyCardPopup } from '../components/popupMaps/PropertyCardPopup';
import { PropertyModal } from '../components/popupMaps/PropertyModal';


// --- Ícones ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import {useLocation} from "react-router-dom";

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
L.Marker.prototype.options.icon = DefaultIcon;

const iconMarkup = renderToStaticMarkup(
    <div style={{ backgroundColor: '#6200EA', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: '0 3px 8px rgba(0,0,0,0.4)' }}>
        <HomeIcon style={{ color: 'white', fontSize: '20px' }} />
    </div>
);
const customHomeIcon = L.divIcon({ html: iconMarkup, className: 'custom-leaflet-icon', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -40] });

// --- TIPOS ---
interface Property {
    id: string;
    name: string;
    description: string;
    clientName: string;
    lat: number;
    lng: number;
    matricula: string;
    rentValue: string;
    rentDueDate: string;
    contractDueDate: string;
    iptuStatus: string;
    rentPaymentStatus: string;
    propertyType: string;
}

// --- Componentes Internos ---
function MapController({ center, zoom }: { center: { lat: number; lng: number }, zoom: number }) {
    const map = useMap();
    useEffect(() => { map.flyTo([center.lat, center.lng], zoom, { duration: 1.5 }); }, [center, zoom, map]);
    return null;
}

function CustomControls() {
    const map = useMap();
    const buttonStyle = { width: 44, height: 44, bgcolor: 'white', color: '#555', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0,0,0,0.15)', '&:hover': { bgcolor: '#f5f5f5', color: '#6C4FFF' } };
    return (
        <Box sx={{ position: 'absolute', bottom: 35, right: 35, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <IconButton sx={buttonStyle} onClick={() => map.flyTo([MAP_DEFAULTS.initialPosition.lat, MAP_DEFAULTS.initialPosition.lng], MAP_DEFAULTS.initialZoom)}><MyLocationIcon /></IconButton>
            <IconButton sx={buttonStyle} onClick={() => map.zoomIn()}><AddIcon /></IconButton>
            <IconButton sx={buttonStyle} onClick={() => map.zoomOut()}><RemoveIcon /></IconButton>
        </Box>
    );
}

export function RealEstateMap() {
    const location = useLocation();
    const [mapState, setMapState] = useState({ center: MAP_DEFAULTS.initialPosition, zoom: MAP_DEFAULTS.initialZoom });
    const [properties, setProperties] = useState<Property[]>([]);

    // --- ESTADOS DO MODAL E EDIÇÃO ---
    const [openModal, setOpenModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [newLocation, setNewLocation] = useState<{lat: number, lng: number, address?: string} | null>(null);

    // --- ESTADOS DE INTERAÇÃO ---
    const [pickedLocation, setPickedLocation] = useState<{ lat: number, lng: number, address: string, loading: boolean } | null>(null);
    const markerRefs = useRef<{ [key: string]: any }>({}); // Para abrir popup via código

    // --- ESTADO DA BUSCA ---
    const [searchValue, setSearchValue] = useState<Property | null>(null);

    useEffect(() => { loadProperties(); }, []);

    const loadProperties = async () => {
        try {
            const response = await api.get('/properties');
            setProperties(response.data);
        } catch (error) { console.error(error); }
    };

    // --- CLIQUE NO MAPA (REVERSE GEOCODING) ---
    function MapClickHandler() {
        useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;
                setPickedLocation({ lat, lng, address: "Buscando endereço...", loading: true });
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`);
                    const data = await response.json();
                    let formatted = "Local selecionado";
                    if(data && data.address) formatted = `${data.address.road || ''}, ${data.address.house_number || 'S/N'}`;

                    setPickedLocation({ lat, lng, address: formatted, loading: false });
                } catch (error) {
                    setPickedLocation({ lat, lng, address: "Local selecionado", loading: false });
                }
            },
        });
        return null;
    }

    // --- HANDLERS ---

    const handleOpenAdd = (lat?: number, lng?: number, address?: string) => {
        setEditingProperty(null);
        setNewLocation({ lat: lat || 0, lng: lng || 0, address });
        setOpenModal(true);
    };

    const handleOpenEdit = (prop: Property) => {
        setNewLocation(null);
        setEditingProperty(prop);
        setOpenModal(true);
    };

    const handleSaveSuccess = () => {
        loadProperties();
        setPickedLocation(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Excluir este imóvel?")) {
            try { await api.delete(`/properties/${id}`); loadProperties(); } catch (error) { alert("Erro ao excluir."); }
        }
    }

    return (
        <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>

            {/* BARRA DE BUSCA LIMPA (SÓ FILTRA IMÓVEIS) */}
            <Box sx={{ position: 'absolute', top: 35, left: 35, zIndex: 1000, width: 'calc(100% - 80px)', maxWidth: '400px' }}>
                <Paper elevation={0} sx={{ borderRadius: '50px', p: '4px 12px', display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
                    <Autocomplete
                        id="smart-search"
                        freeSolo
                        fullWidth
                        options={properties} // Lista apenas seus imóveis
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                        value={searchValue}

                        // AQUI A MÁGICA ACONTECE: Selecionou -> Voa -> Abre Popup
                        onChange={(event, newValue) => {
                            setSearchValue(newValue as Property | null);
                            if (newValue && typeof newValue !== 'string') {
                                const prop = newValue as Property;
                                // 1. Voa para o local
                                setMapState({ center: { lat: prop.lat, lng: prop.lng }, zoom: 18 });

                                // 2. Abre o Popup do marcador correspondente
                                setTimeout(() => {
                                    const marker = markerRefs.current[prop.id];
                                    if (marker) marker.openPopup();
                                }, 500); // Delay para dar tempo de voar
                            }
                        }}

                        renderOption={(props, option) => {
                            const prop = option as Property;
                            return (
                                <ListItem {...props}>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <HomeIcon sx={{ color: '#6200EA' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={prop.name}
                                        secondary={prop.clientName || "Vago"}
                                    />
                                </ListItem>
                            )
                        }}

                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Buscar meus imóveis..."
                                variant="standard"
                                InputProps={{
                                    ...params.InputProps,
                                    disableUnderline: true,
                                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#6C4FFF', ml: 1 }} /></InputAdornment>
                                }}
                            />
                        )}
                    />
                </Paper>
            </Box>

            <MapContainer center={[MAP_DEFAULTS.initialPosition.lat, MAP_DEFAULTS.initialPosition.lng]} zoom={MAP_DEFAULTS.initialZoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapController center={mapState.center} zoom={mapState.zoom} />

                {/* MARCADORES SALVOS */}
                {properties.map(prop => (
                    <Marker
                        key={prop.id}
                        position={[prop.lat, prop.lng]}
                        icon={customHomeIcon}
                        ref={(el) => markerRefs.current[prop.id] = el} // Conecta referência
                    >
                        <Popup className="custom-popup" maxWidth={280} minWidth={280} closeButton={false} style={{ padding: 0 }}>
                            <PropertyCardPopup
                                title={prop.name}
                                description={prop.description}
                                clientName={prop.clientName}
                                matricula={prop.matricula}
                                rentValue={prop.rentValue}
                                rentDueDate={prop.rentDueDate}
                                contractDueDate={prop.contractDueDate}
                                iptuStatus={prop.iptuStatus}
                                rentPaymentStatus={prop.rentPaymentStatus}
                                onEdit={() => handleOpenEdit(prop)}
                                onDelete={() => handleDelete(prop.id)}
                            />
                        </Popup>
                    </Marker>
                ))}

                {/* PINO TEMPORÁRIO (Apenas ao clicar no mapa) */}
                {pickedLocation && (
                    <Marker position={[pickedLocation.lat, pickedLocation.lng]} icon={customHomeIcon}>
                        <Popup offset={[0, -10]} maxWidth={300}>
                            <PropertyCardPopup
                                title="Local Selecionado"
                                description={pickedLocation.address}
                                loading={pickedLocation.loading}
                                onAction={() => handleOpenAdd(pickedLocation.lat, pickedLocation.lng, pickedLocation.address)}
                                actionLabel="Cadastrar aqui"
                            />
                        </Popup>
                    </Marker>
                )}
                <MapClickHandler />
                <CustomControls />
            </MapContainer>

            {/* MODAL UNIFICADO */}
            <PropertyModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSaveSuccess={handleSaveSuccess}
                propertyToEdit={editingProperty}
                initialLat={newLocation?.lat}
                initialLng={newLocation?.lng}
                initialAddress={newLocation?.address}
            />
        </Box>
    );
}