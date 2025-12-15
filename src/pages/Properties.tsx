import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, InputAdornment, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, IconButton, Tooltip, CircularProgress, Pagination,
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    HomeWork as HomeIcon,
    Visibility as ViewIcon,
    History as HistoryIcon, //  NOVO ÍCONE
} from '@mui/icons-material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { PropertyModal } from '../components/popupMaps/PropertyModal';
import type { PropertyListItemDTO } from '../types/Property';

export function Properties() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<PropertyListItemDTO[]>([]);
    const [editingProperty, setEditingProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => { loadProperties(); }, []);

    const loadProperties = async () => {
        try {
            setLoading(true);
            const response = await api.get('/properties');
            setProperties(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este imóvel?")) {
            try {
                await api.delete(`/properties/${id}`);
                setProperties(properties.filter(p => p.id !== id));
            } catch (error) {
                alert("Erro ao excluir.");
            }
        }
    };

    const handleOpenEdit = async (prop: PropertyListItemDTO) => {
        try {
            const { data } = await api.get(`/properties/${prop.id}`);
            setEditingProperty(data); // agora é o details DTO (completo)
            setOpenModal(true);
        } catch (e) {
            console.error(e);
            alert('Erro ao carregar detalhes do imóvel para edição.');
        }
    };


    const handleViewOnMap = (prop: PropertyListItemDTO) => {
        navigate('/maps', { state: { focusId: prop.id, lat: prop.lat, lng: prop.lng } });
    };

    const handleViewContractsHistory = (prop: PropertyListItemDTO) => {
        navigate(`/tenants?propertyId=${prop.id}`);
    };


    const filteredProperties = properties.filter(prop =>
        prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prop.currentTenant && prop.currentTenant.toLowerCase().includes(searchTerm.toLowerCase()))

    );

    // Chip para Status do Pagamento do Aluguel
    const getRentStatusChip = (status: string) => {
        if (status === 'atrasado') {
            return (
                <Chip
                    label="Atrasado"
                    size="small"
                    sx={{ bgcolor: '#FFEBEE', color: '#D32F2F', fontWeight: 'bold' }}
                />
            );
        }
        return (
            <Chip
                label="Em dia"
                size="small"
                sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 'bold' }}
            />
        );
    };

    // Chip para Status do IPTU
    const getIptuStatusChip = (status: string) => {
        if (status === 'Pago') {
            return (
                <Chip
                    label="Pago"
                    size="small"
                    sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 'bold' }}
                />
            );
        }
        if (status === 'Isento') {
            return (
                <Chip
                    label="Isento"
                    size="small"
                    sx={{ bgcolor: '#E3F2FD', color: '#1976D2', fontWeight: 'bold' }}
                />
            );
        }
        return (
            <Chip
                label="Pendente"
                size="small"
                sx={{ bgcolor: '#FFEBEE', color: '#D32F2F', fontWeight: 'bold' }}
            />
        );
    };

    return (
        <Box>
            <Box
                sx={{
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 'bold', color: '#1A1A1A' }}
                    >
                        Propriedades
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Gerenciamento completo dos imóveis
                    </Typography>
                </Box>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: '16px',
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                }}
            >
                <TextField
                    placeholder="Buscar endereço, inquilino..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flex: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#999' }} />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: '16px', overflowX: 'auto' }}
            >
                <Table sx={{ minWidth: 1100 }}>
                    <TableHead sx={{ bgcolor: '#F8F9FA' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>
                                Imóvel
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>
                                Tipo
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>
                                Inquilino
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>
                                Matrícula
                            </TableCell>

                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>
                                Venc. Aluguel
                            </TableCell>
                            {/* 👇 COLUNA NOVA */}
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>
                                Venc. Contrato
                            </TableCell>

                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>
                                Valor
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>
                                Pagamento
                            </TableCell>

                            {/* 👇 COLUNA NOVA */}
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>
                                IPTU
                            </TableCell>

                            <TableCell
                                align="right"
                                sx={{ fontWeight: 'bold', color: '#666' }}
                            >
                                Ações
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                                    <CircularProgress sx={{ color: '#6C4FFF' }} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProperties.map((prop) => (
                                <TableRow
                                    key={prop.id}
                                    sx={{ '&:hover': { bgcolor: '#F5F7FF' } }}
                                >
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    p: 0.8,
                                                    borderRadius: '8px',
                                                    bgcolor: '#F3E5F5',
                                                    color: '#6200EA',
                                                }}
                                            >
                                                <HomeIcon fontSize="small" />
                                            </Box>
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="bold"
                                                    color="#333"
                                                    sx={{
                                                        maxWidth: 200,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {prop.name}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {prop.propertyType || 'Casa'}
                                    </TableCell>
                                    <TableCell>{prop.currentTenant ?? '-'}</TableCell>
                                    <TableCell
                                        sx={{ fontFamily: 'monospace', color: '#555' }}
                                    >
                                        {prop.matricula || '-'}
                                    </TableCell>

                                    <TableCell>-</TableCell>

                                    {/* VENCIMENTO DO CONTRATO */}
                                    <TableCell>{prop.currentContractEndDate ?? '-'}</TableCell>


                                    <TableCell
                                        sx={{ fontWeight: 'bold', color: '#6200EA' }}
                                    >
                                        {prop.currentRentValue ?? '-'}
                                    </TableCell>
                                    <TableCell>
                                        {getRentStatusChip(prop.currentContractStatus === 'ACTIVE' ? 'emdia' : 'atrasado')}
                                    </TableCell>

                                    {/* STATUS DO IPTU */}
                                    <TableCell>
                                        {getIptuStatusChip(prop.iptuStatus ?? 'Pendente')}
                                    </TableCell>

                                    <TableCell align="right">
                                        {/*HISTÓRICO DE CONTRATOS */}
                                        <Tooltip title="Histórico de contratos">
                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleViewContractsHistory(prop)
                                                }
                                                sx={{ color: '#6C4FFF', mr: 0.5 }}
                                            >
                                                <HistoryIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Ver no Mapa">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewOnMap(prop)}
                                                sx={{ color: '#666', mr: 0.5 }}
                                            >
                                                <ViewIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Editar">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenEdit(prop)}
                                                sx={{ color: '#6200EA', mr: 0.5 }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Excluir">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(prop.id)}
                                                sx={{ color: '#D32F2F' }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <PropertyModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSaveSuccess={loadProperties}
                propertyToEdit={editingProperty}
                initialLat={0}
                initialLng={0}
            />
        </Box>
    );
}
