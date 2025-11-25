import { useState, useEffect, useRef, useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Autocomplete,
    InputAdornment,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    MyLocation as MyLocationIcon,
    Search as SearchIcon,
    Home as HomeIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
} from '@mui/icons-material';

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Marker as LeafletMarker } from 'leaflet';

import { MAP_DEFAULTS } from '../utils/mapConfig';
import api from '../services/api';

// COMPONENTES
import { PropertyCardPopup } from '../components/popupMaps/PropertyCardPopup';
import { PropertyModal } from '../components/popupMaps/PropertyModal';
import { PropertyCarouselPopup } from '../components/popupMaps/PropertyCarouselPopup';

// ÍCONES BASE DO LEAFLET
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Property } from '../types/Property';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Define o ícone padrão de Marker
L.Marker.prototype.options.icon = DefaultIcon;

// Ícone customizado roxo com casa
const iconMarkup = renderToStaticMarkup(
    <div
        style={{
            backgroundColor: '#6200EA',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
        }}
    >
        <HomeIcon style={{ color: 'white', fontSize: '20px' }} />
    </div>,
);

const customHomeIcon = L.divIcon({
    html: iconMarkup,
    className: 'custom-leaflet-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -40],
});

// --- Componentes Internos ---

// Controla "voar" do mapa quando center/zoom mudam
function MapController({
                           center,
                           zoom,
                       }: {
    center: { lat: number; lng: number };
    zoom: number;
}) {
    const map = useMap();

    useEffect(() => {
        map.flyTo([center.lat, center.lng], zoom, { duration: 1.5 });
    }, [center, zoom, map]);

    return null;
}

// Botões customizados (zoom + voltar para posição inicial)
function CustomControls() {
    const map = useMap();
    const buttonStyle = {
        width: 44,
        height: 44,
        bgcolor: 'white',
        color: '#555',
        borderRadius: '12px',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
        '&:hover': { bgcolor: '#f5f5f5', color: '#6C4FFF' },
    };

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 35,
                right: 35,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
            }}
        >
            <IconButton
                sx={buttonStyle}
                onClick={() =>
                    map.flyTo(
                        [MAP_DEFAULTS.initialPosition.lat, MAP_DEFAULTS.initialPosition.lng],
                        MAP_DEFAULTS.initialZoom,
                    )
                }
            >
                <MyLocationIcon />
            </IconButton>

            <IconButton sx={buttonStyle} onClick={() => map.zoomIn()}>
                <AddIcon />
            </IconButton>

            <IconButton sx={buttonStyle} onClick={() => map.zoomOut()}>
                <RemoveIcon />
            </IconButton>
        </Box>
    );
}

export function RealEstateMap() {
    // Centro e zoom do mapa (usado para voar até imóvel da busca)
    const [mapState, setMapState] = useState({
        center: MAP_DEFAULTS.initialPosition,
        zoom: MAP_DEFAULTS.initialZoom,
    });

    // Lista de imóveis vindos da API
    const [properties, setProperties] = useState<Property[]>([]);

    // Grupo de imóveis por coordenada
    interface PropertyGroup {
        key: string;
        lat: number;
        lng: number;
        properties: Property[];
    }

    // Agrupa imóveis com mesmo lat/lng em um único marcador
    const groupedProperties = useMemo<PropertyGroup[]>(() => {
        const map = new Map<string, PropertyGroup>();

        properties.forEach((prop) => {
            // chave baseada em lat/lng (ajuste as casas decimais se quiser "juntar" pontos muito próximos)
            const key = `${prop.lat.toFixed(6)}-${prop.lng.toFixed(6)}`;

            if (!map.has(key)) {
                map.set(key, {
                    key,
                    lat: prop.lat,
                    lng: prop.lng,
                    properties: [prop],
                });
            } else {
                map.get(key)!.properties.push(prop);
            }
        });

        return Array.from(map.values());
    }, [properties]);

    // --- ESTADOS DO MODAL E EDIÇÃO ---
    const [openModal, setOpenModal] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [newLocation, setNewLocation] = useState<{
        lat: number;
        lng: number;
        address?: string;
    } | null>(null);

    // --- ESTADO DO PINO TEMPORÁRIO AO CLICAR NO MAPA ---
    const [pickedLocation, setPickedLocation] = useState<{
        lat: number;
        lng: number;
        address: string;
        loading: boolean;
    } | null>(null);

    // Refs para markers, para abrir popup via código ao selecionar na busca
    const markerRefs = useRef<{ [key: string]: LeafletMarker | null }>({});

    // --- ESTADO DA BUSCA ---
    const [searchValue, setSearchValue] = useState<Property | null>(null);

    const handleEdit = (property: Property) => {
        setEditingProperty(property);
        setNewLocation(null);
        setOpenModal(true);
    };

    // Carrega imóveis ao montar
    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            const response = await api.get('/properties');
            setProperties(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    // --- CLIQUE NO MAPA (REVERSE GEOCODING) ---
    function MapClickHandler() {
        useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;

                setPickedLocation({
                    lat,
                    lng,
                    address: 'Buscando endereço...',
                    loading: true,
                });

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`,
                    );
                    const data = await response.json();

                    let formatted = 'Local selecionado';
                    if (data && data.address) {
                        formatted = `${data.address.road || ''}, ${
                            data.address.house_number || 'S/N'
                        }`;
                    }

                    setPickedLocation({
                        lat,
                        lng,
                        address: formatted,
                        loading: false,
                    });
                } catch (error) {
                    setPickedLocation({
                        lat,
                        lng,
                        address: 'Local selecionado',
                        loading: false,
                    });
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

    // Agora recebe a Property, não só o id
    const handleDelete = async (property: Property) => {
        if (confirm('Excluir este imóvel?')) {
            try {
                await api.delete(`/properties/${property.id}`);
                await loadProperties();
            } catch (error) {
                alert('Erro ao excluir.');
            }
        }
    };

    return (
        <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
            {/* BARRA DE BUSCA */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 35,
                    left: 35,
                    zIndex: 1000,
                    width: 'calc(100% - 80px)',
                    maxWidth: '400px',
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '50px',
                        p: '4px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    }}
                >
                    <Autocomplete<Property, false, false, true>
                        id="smart-search"
                        freeSolo
                        fullWidth
                        options={properties}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : option.name
                        }
                        value={searchValue}
                        onChange={(event, newValue) => {
                            // Quando usa freeSolo, newValue pode ser string ou Property
                            if (!newValue || typeof newValue === 'string') {
                                setSearchValue(null);
                                return;
                            }

                            const prop = newValue as Property;
                            setSearchValue(prop);

                            // 1. Voa para o local
                            setMapState({
                                center: { lat: prop.lat, lng: prop.lng },
                                zoom: 18,
                            });

                            // 2. Abre o popup do marcador correspondente
                            setTimeout(() => {
                                const marker = markerRefs.current[prop.id];
                                if (marker) {
                                    marker.openPopup();
                                }
                            }, 500);
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
                                        secondary={prop.clientName || 'Vago'}
                                    />
                                </ListItem>
                            );
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Buscar meus imóveis..."
                                variant="standard"
                                InputProps={{
                                    ...params.InputProps,
                                    disableUnderline: true,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: '#6C4FFF', ml: 1 }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />
                </Paper>
            </Box>

            {/* MAPA */}
            <MapContainer
                center={[
                    MAP_DEFAULTS.initialPosition.lat,
                    MAP_DEFAULTS.initialPosition.lng,
                ]}
                zoom={MAP_DEFAULTS.initialZoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController center={mapState.center} zoom={mapState.zoom} />

                {/* MARCADORES AGRUPADOS */}
                {groupedProperties.map((group) => (
                    <Marker
                        key={group.key}
                        position={[group.lat, group.lng]}
                        icon={customHomeIcon}
                        ref={(el) => {
                            const first = group.properties[0];
                            if (first && el) {
                                markerRefs.current[first.id] = el;
                            }
                        }}
                    >
                        <Popup
                            className="custom-popup"
                            maxWidth={280}
                            minWidth={280}
                            closeButton={false}
                            style={{ padding: 0 }}
                        >
                            <PropertyCarouselPopup
                                properties={group.properties}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onAddAnother={(property) =>
                                    handleOpenAdd(property.lat, property.lng, property.address)
                                }
                            />
                        </Popup>
                    </Marker>
                ))}

                {/* PINO TEMPORÁRIO AO CLICAR NO MAPA */}
                {pickedLocation && (
                    <Marker
                        position={[pickedLocation.lat, pickedLocation.lng]}
                        icon={customHomeIcon}
                    >
                        <Popup offset={[0, -10]} maxWidth={300}>
                            <PropertyCardPopup
                                title="Local Selecionado"
                                description={pickedLocation.address}
                                loading={pickedLocation.loading}
                                onAction={() =>
                                    handleOpenAdd(
                                        pickedLocation.lat,
                                        pickedLocation.lng,
                                        pickedLocation.address,
                                    )
                                }
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
