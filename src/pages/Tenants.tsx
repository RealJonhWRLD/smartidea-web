import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    TextField,
    InputAdornment,
    List,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Chip,
    Divider,
    CircularProgress,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@mui/material';
import {
    Search as SearchIcon,
    HomeWork as HomeIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { ContractsService, type Contract } from '../services/contracts';

interface Property {
    id: string;
    name: string;
    propertyType: string;
    description?: string | null;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    propertyStatus: string; // "Disponível", "Alugado", etc.
    clientName?: string | null;   // inquilino atual (snapshot do imóvel)
    clientPhone?: string | null;
}

export function Tenants() {
    const [searchParams] = useSearchParams();
    const initialPropertyIdFromUrl = searchParams.get('propertyId');

    const [properties, setProperties] = useState<Property[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loadingContracts, setLoadingContracts] = useState(false);

    const [search, setSearch] = useState('');

    // --------- CARREGAR IMÓVEIS ----------
    async function loadProperties() {
        try {
            setLoadingProperties(true);
            const response = await api.get<Property[]>('/properties');
            const list = response.data ?? [];

            setProperties(list);

            if (list.length > 0 && !selectedProperty) {
                if (initialPropertyIdFromUrl) {
                    const found = list.find(
                        (p) => String(p.id) === String(initialPropertyIdFromUrl),
                    );
                    setSelectedProperty(found ?? list[0]);
                } else {
                    setSelectedProperty(list[0]);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar imóveis', error);
        } finally {
            setLoadingProperties(false);
        }
    }

    // --------- CARREGAR CONTRATOS DO IMÓVEL ----------
    async function loadContracts(propertyId: string) {
        try {
            setLoadingContracts(true);
            const response = await ContractsService.listByProperty(propertyId);
            setContracts(response.data ?? []);
        } catch (error) {
            console.error('Erro ao carregar contratos do imóvel', error);
            setContracts([]);
        } finally {
            setLoadingContracts(false);
        }
    }

    useEffect(() => {
        void loadProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedProperty?.id) {
            void loadContracts(selectedProperty.id);
        }
    }, [selectedProperty?.id]);

    // --------- FILTRO DE IMÓVEIS ----------
    const filteredProperties = useMemo(() => {
        if (!search.trim()) return properties;

        const term = search.toLowerCase();

        return properties.filter((p) => {
            const parts = [
                p.name,
                p.propertyType,
                p.street,
                p.number,
                p.neighborhood,
                p.city,
                p.state,
                p.clientName,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return parts.includes(term);
        });
    }, [properties, search]);

    // --------- HELPERS ----------
    function formatAddress(property: Property) {
        return `${property.street}, ${property.number} - ${property.neighborhood} - ${property.city}/${property.state}`;
    }

    function formatPeriod(c: Contract) {
        if (c.endDate) {
            return `${c.startDate} → ${c.endDate}`;
        }
        return `${c.startDate} → Atual`;
    }

    function getStatusChip(c: Contract) {
        const isActive = c.status === 'ACTIVE';

        return (
            <Chip
                label={isActive ? 'Ativo' : 'Encerrado'}
                size="small"
                sx={{
                    bgcolor: isActive ? '#E8F5E9' : '#FFF3E0',
                    color: isActive ? '#2E7D32' : '#EF6C00',
                    fontWeight: 'bold',
                }}
            />
        );
    }

    function getPropertyStatusChip(property: Property) {
        const isAvailable = property.propertyStatus === 'Disponível';

        return (
            <Chip
                label={property.propertyStatus || 'Sem status'}
                size="small"
                sx={{
                    bgcolor: isAvailable ? '#E3F2FD' : '#FFF3E0',
                    color: isAvailable ? '#1565C0' : '#EF6C00',
                    fontWeight: 'bold',
                }}
            />
        );
    }

    return (
        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 120px)' }}>
            {/* COLUNA ESQUERDA - LISTA DE IMÓVEIS */}
            <Box sx={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Imóveis / Inquilinos
                </Typography>

                <TextField
                    size="small"
                    placeholder="Buscar por endereço ou inquilino..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />

                <Paper variant="outlined" sx={{ flex: 1, overflow: 'auto' }}>
                    {loadingProperties && (
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {!loadingProperties && filteredProperties.length === 0 && (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Nenhum imóvel encontrado.
                            </Typography>
                        </Box>
                    )}

                    {!loadingProperties && filteredProperties.length > 0 && (
                        <List
                            dense
                            subheader={
                                <ListSubheader component="div">
                                    {filteredProperties.length} imóvel(is) encontrado(s)
                                </ListSubheader>
                            }
                        >
                            {filteredProperties.map((property) => {
                                const selected = selectedProperty?.id === property.id;

                                return (
                                    <ListItemButton
                                        key={property.id}
                                        selected={selected}
                                        onClick={() => setSelectedProperty(property)}
                                        alignItems="flex-start"
                                    >
                                        <ListItemText
                                            primary={
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <HomeIcon fontSize="small" />
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{ fontWeight: 600 }}
                                                    >
                                                        {property.name || 'Imóvel sem nome'}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ display: 'block' }}
                                                    >
                                                        {formatAddress(property)}
                                                    </Typography>

                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            mt: 0.5,
                                                        }}
                                                    >
                                                        {getPropertyStatusChip(property)}

                                                        {property.clientName && (
                                                            <Chip
                                                                icon={<PersonIcon />}
                                                                label={property.clientName}
                                                                size="small"
                                                                sx={{ maxWidth: 180 }}
                                                            />
                                                        )}
                                                    </Box>
                                                </>
                                            }
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    )}
                </Paper>
            </Box>

            {/* COLUNA DIREITA - DETALHES + HISTÓRICO */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedProperty ? (
                    <>
                        {/* Card do imóvel */}
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                mb: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {selectedProperty.name || 'Imóvel selecionado'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatAddress(selectedProperty)}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {getPropertyStatusChip(selectedProperty)}
                                    {selectedProperty.propertyType && (
                                        <Chip
                                            label={selectedProperty.propertyType}
                                            size="small"
                                        />
                                    )}
                                </Box>
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Inquilino atual
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon fontSize="small" />
                                        <Typography variant="body2">
                                            {selectedProperty.clientName || 'Sem inquilino ativo'}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Telefone
                                    </Typography>
                                    <Typography variant="body2">
                                        {selectedProperty.clientPhone || '-'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Histórico de contratos */}
                        <Paper variant="outlined" sx={{ flex: 1, p: 2, overflow: 'auto' }}>
                            <Typography
                                variant="subtitle1"
                                sx={{ mb: 2, fontWeight: 600 }}
                            >
                                Histórico de contratos
                            </Typography>

                            {loadingContracts && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        mt: 3,
                                    }}
                                >
                                    <CircularProgress size={24} />
                                </Box>
                            )}

                            {!loadingContracts && contracts.length === 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Nenhum contrato encontrado para este imóvel.
                                </Typography>
                            )}

                            {!loadingContracts && contracts.length > 0 && (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Inquilino</TableCell>
                                            <TableCell>Telefone</TableCell>
                                            <TableCell>Período</TableCell>
                                            <TableCell>Valor aluguel</TableCell>
                                            <TableCell>Condomínio</TableCell>
                                            <TableCell>Dia pgto</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Motivo rescisão</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {contracts.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell>{c.tenantName}</TableCell>
                                                <TableCell>{c.tenantPhone}</TableCell>
                                                <TableCell>{formatPeriod(c)}</TableCell>
                                                <TableCell>{c.rentValue}</TableCell>
                                                <TableCell>{c.condoValue}</TableCell>
                                                <TableCell>{c.paymentDay}</TableCell>
                                                <TableCell>{getStatusChip(c)}</TableCell>
                                                <TableCell>
                                                    {c.terminationReason || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </Paper>
                    </>
                ) : (
                    <Paper
                        variant="outlined"
                        sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Selecione um imóvel na lista ao lado para ver o histórico de
                            contratos.
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
}
