import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
} from '@mui/material';
import { ContractsService, type Contract } from '../services/contracts';

interface ContractsPageProps {
    propertyId?: string; // pode vir via rota, props ou seleção futura
}

export function Contracts({ propertyId }: ContractsPageProps) {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!propertyId) return;
        setLoading(true);
        ContractsService.listByProperty(propertyId)
            .then(res => setContracts(res.data))
            .finally(() => setLoading(false));
    }, [propertyId]);

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A1A1A' }}>
                        Contratos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Histórico de contratos do imóvel
                    </Typography>
                </Box>

                {/* Depois você pode adicionar botão para criar contrato a partir daqui */}
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid #f0f0f0' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                        <TableRow>
                            <TableCell>Inquilino</TableCell>
                            <TableCell>Início</TableCell>
                            <TableCell>Fim</TableCell>
                            <TableCell>Meses</TableCell>
                            <TableCell>Aluguel</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Motivo Rescisão</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contracts.map(c => (
                            <TableRow key={c.id}>
                                <TableCell>{c.tenantName}</TableCell>
                                <TableCell>{c.startDate}</TableCell>
                                <TableCell>{c.endDate || '-'}</TableCell>
                                <TableCell>{c.monthsInContract ?? '-'}</TableCell>
                                <TableCell>{c.rentValue}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={c.status === 'ACTIVE' ? 'Ativo' : 'Encerrado'}
                                        size="small"
                                        sx={{
                                            bgcolor: c.status === 'ACTIVE' ? '#E8F5E9' : '#FFF3E0',
                                            color: c.status === 'ACTIVE' ? '#2E7D32' : '#EF6C00',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{c.terminationReason || '-'}</TableCell>
                            </TableRow>
                        ))}

                        {!loading && contracts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Nenhum contrato encontrado para este imóvel.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}