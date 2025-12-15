import { useEffect, useState } from 'react';
import {
    Box,
    Card,
    Chip,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    TextField,
    Typography,
    CircularProgress,
    Grid,
    Button,
} from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';

import api from '../services/api';
import type { PropertyDetailsDTO, PropertyListItemDTO } from '../types/Property';
import type { ContractHistoryItemDTO } from '../types/Contract';
import { LinkContractModal } from '../components/contracts/LinkContractModal';

type StatusFilter = 'ALL' | 'ALUGADO' | 'DISPONIVEL';

// ---- Helpers de UI (fora do componente) ----
const getPropertyStatusChipColor = (
    status: PropertyListItemDTO['status'],
): ChipProps['color'] => {
    if (status === 'ALUGADO') return 'warning';
    if (status === 'DISPONIVEL') return 'success';
    return 'default';
};

const getFilterChipColor = (active: boolean): ChipProps['color'] =>
    active ? 'primary' : 'default';

const getContractStatusChipColor = (status: string): ChipProps['color'] => {
    if (status === 'ACTIVE') return 'success';
    if (status === 'FINISHED') return 'default';
    if (status === 'RESCINDED') return 'warning';
    return 'default';
};

const contractLabel = (status: string) => {
    if (status === 'ACTIVE') return 'Ativo';
    if (status === 'FINISHED') return 'Encerrado';
    if (status === 'RESCINDED') return 'Rescindido';
    return status;
};

const formatAddressFromDescription = (description?: string | null) => {
    if (!description) return 'Endereço não informado';
    return description;
};

export function Tenants() {
    const [properties, setProperties] = useState<PropertyListItemDTO[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<PropertyListItemDTO[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

    const [propertyDetails, setPropertyDetails] = useState<PropertyDetailsDTO | null>(null);
    const [contractsHistory, setContractsHistory] = useState<ContractHistoryItemDTO[]>([]);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

    const [loadingList, setLoadingList] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [openLinkModal, setOpenLinkModal] = useState(false);

    // ---- Carregar lista de imóveis (sidebar) ----
    const fetchProperties = async () => {
        try {
            setLoadingList(true);
            const response = await api.get<PropertyListItemDTO[]>('/properties');

            setProperties(response.data);
            setFilteredProperties(response.data);

            if (response.data.length > 0 && !selectedPropertyId) {
                setSelectedPropertyId(response.data[0].id);
            }
        } catch (error) {
            console.error('Erro ao buscar imóveis:', error);
        } finally {
            setLoadingList(false);
        }
    };

    // ---- Carregar detalhes + histórico do imóvel selecionado ----
    const fetchPropertyDetailsAndContracts = async (propertyId: string) => {
        try {
            setLoadingDetails(true);

            const [detailsRes, contractsRes] = await Promise.all([
                api.get<PropertyDetailsDTO>(`/properties/${propertyId}`),
                api.get<ContractHistoryItemDTO[]>(`/properties/${propertyId}/contracts`),
            ]);

            setPropertyDetails(detailsRes.data);
            setContractsHistory(contractsRes.data);
        } catch (error) {
            console.error('Erro ao buscar detalhes do imóvel:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    // carrega lista inicial
    useEffect(() => {
        fetchProperties();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ao trocar imóvel, fecha modal e carrega detalhes
    useEffect(() => {
        setOpenLinkModal(false);

        if (selectedPropertyId) {
            fetchPropertyDetailsAndContracts(selectedPropertyId);
        } else {
            setPropertyDetails(null);
            setContractsHistory([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPropertyId]);

    // filtro por busca + status
    useEffect(() => {
        let result = [...properties];

        if (search.trim()) {
            const term = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(term) ||
                    (p.description ?? '').toLowerCase().includes(term) ||
                    (p.currentTenant ?? '').toLowerCase().includes(term),
            );
        }

        if (statusFilter !== 'ALL') {
            result = result.filter((p) => p.status === statusFilter);
        }

        setFilteredProperties(result);
    }, [search, statusFilter, properties]);

    // contrato atual (ACTIVE)
    const currentContract = contractsHistory.find((c) => c.status === 'ACTIVE');

    return (
        <Box display="flex" height="100%" gap={2}>
            {/* COLUNA ESQUERDA - LISTA DE IMÓVEIS */}
            <Box width="320px" display="flex" flexDirection="column" gap={2}>
                <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Imóveis / Inquilinos
                    </Typography>

                    <TextField
                        size="small"
                        placeholder="Buscar por imóvel ou inquilino..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <Stack direction="row" spacing={1} mb={2}>
                        <Chip
                            label="Todos"
                            size="small"
                            color={getFilterChipColor(statusFilter === 'ALL')}
                            onClick={() => setStatusFilter('ALL')}
                        />
                        <Chip
                            label="Alugados"
                            size="small"
                            color={getFilterChipColor(statusFilter === 'ALUGADO')}
                            onClick={() => setStatusFilter('ALUGADO')}
                        />
                        <Chip
                            label="Disponíveis"
                            size="small"
                            color={getFilterChipColor(statusFilter === 'DISPONIVEL')}
                            onClick={() => setStatusFilter('DISPONIVEL')}
                        />
                    </Stack>

                    <Divider />

                    <Box flex={1} mt={1} sx={{ overflowY: 'auto' }}>
                        {loadingList ? (
                            <Box display="flex" justifyContent="center" mt={4}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : filteredProperties.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" mt={2}>
                                Nenhum imóvel encontrado.
                            </Typography>
                        ) : (
                            <List dense>
                                {filteredProperties.map((property) => (
                                    <ListItemButton
                                        key={property.id}
                                        selected={property.id === selectedPropertyId}
                                        onClick={() => setSelectedPropertyId(property.id)}
                                        sx={{ borderRadius: 1, mb: 0.5 }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {property.name}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={property.status === 'ALUGADO' ? 'Alugado' : 'Disponível'}
                                                        color={getPropertyStatusChipColor(property.status)}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box mt={0.5}>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        {formatAddressFromDescription(property.description)}
                                                    </Typography>
                                                    {property.currentTenant && (
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Inquilino: <strong>{property.currentTenant}</strong>
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        )}
                    </Box>
                </Card>
            </Box>

            {/* COLUNA DIREITA */}
            <Box flex={1} display="flex" flexDirection="column" gap={2}>
                <Card sx={{ p: 3 }}>
                    {loadingDetails && !propertyDetails ? (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : !propertyDetails ? (
                        <Typography variant="body1" color="text.secondary">
                            Selecione um imóvel na lista ao lado para ver os detalhes.
                        </Typography>
                    ) : (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        {propertyDetails.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatAddressFromDescription(propertyDetails.description)}
                                    </Typography>
                                    {propertyDetails.propertyType && (
                                        <Typography variant="body2" color="text.secondary">
                                            Tipo: {propertyDetails.propertyType}
                                        </Typography>
                                    )}
                                </Box>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    {filteredProperties.find((p) => p.id === propertyDetails.id) && (
                                        <Chip
                                            label={
                                                filteredProperties.find((p) => p.id === propertyDetails.id)?.status ===
                                                'ALUGADO'
                                                    ? 'Alugado'
                                                    : 'Disponível'
                                            }
                                            color={getPropertyStatusChipColor(
                                                filteredProperties.find((p) => p.id === propertyDetails.id)!.status,
                                            )}
                                        />
                                    )}

                                    {/* ✅ botão único e correto */}
                                    <Button
                                        variant="contained"
                                        onClick={() => setOpenLinkModal(true)}
                                        disabled={!selectedPropertyId}
                                    >
                                        Vincular inquilino
                                    </Button>
                                </Stack>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Inquilino atual
                                    </Typography>

                                    {currentContract ? (
                                        <Box>
                                            <Typography variant="body2">
                                                <strong>Nome:</strong> {currentContract.tenantName}
                                            </Typography>
                                            {currentContract.startDate && (
                                                <Typography variant="body2">
                                                    <strong>Início contrato:</strong> {currentContract.startDate}
                                                </Typography>
                                            )}
                                            {currentContract.endDate && (
                                                <Typography variant="body2">
                                                    <strong>Fim previsto:</strong> {currentContract.endDate}
                                                </Typography>
                                            )}
                                            <Typography variant="body2">
                                                <strong>Aluguel:</strong> {currentContract.rentValue}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Nenhum contrato ativo para este imóvel.
                                        </Typography>
                                    )}
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Observações do imóvel
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {propertyDetails.notes?.trim()
                                            ? propertyDetails.notes
                                            : 'Nenhuma observação cadastrada.'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Card>

                {/* Histórico de contratos */}
                <Card sx={{ p: 3, flex: 1, minHeight: 200 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Histórico de contratos
                    </Typography>

                    {loadingDetails && !propertyDetails ? (
                        <Box display="flex" justifyContent="center" mt={4}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : contractsHistory.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            Nenhum contrato encontrado para este imóvel.
                        </Typography>
                    ) : (
                        <Box mt={1}>
                            {contractsHistory.map((contract) => (
                                <Box key={contract.id} mb={1.5}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="subtitle2">{contract.tenantName}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {contract.startDate ?? '–'}{' '}
                                                {contract.endDate ? `até ${contract.endDate}` : ''}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Valor: {contract.rentValue}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            size="small"
                                            label={contractLabel(contract.status)}
                                            color={getContractStatusChipColor(contract.status)}
                                        />
                                    </Box>
                                    <Divider sx={{ mt: 1 }} />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Card>
            </Box>

            {/* ✅ MODAL VINCULAR */}
            {selectedPropertyId && (
                <LinkContractModal
                    open={openLinkModal}
                    onClose={() => setOpenLinkModal(false)}
                    onSuccess={() => {
                        setOpenLinkModal(false);
                        fetchPropertyDetailsAndContracts(selectedPropertyId);
                    }}
                    propertyId={selectedPropertyId}
                />
            )}
        </Box>
    );
}
