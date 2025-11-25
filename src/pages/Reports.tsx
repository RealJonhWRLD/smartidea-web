import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, InputAdornment, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Button, Tooltip, CircularProgress, Avatar
} from '@mui/material';
import {
    Search as SearchIcon,
    Download as ExportIcon,
    HomeWork as HomeIcon,
} from '@mui/icons-material';
import api from '../services/api';

// Interface dos dados
interface Property {
    id: string;
    name: string;
    description: string;
    clientName: string;
    propertyType: string;
    rentValue: string;        // Ex: "R$ 1.000,00"
    condoValue: string;
    depositValue: string;     // Caução
    rentDueDate: string;
    contractStartDate: string; // 👉 Início do contrato (NOVO CAMPO)
    contractDueDate: string;   // Fim Contrato
    iptuStatus: string;
}

export function Reports() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        api.get('/properties')
            .then(response => setProperties(response.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Exportar para CSV (Excel) – removido Total Anual e alinhado com as novas colunas
    const handleExport = () => {
        const headers = [
            "Imóvel",
            "Tipo",
            "Endereço",
            "Inquilino",
            "Valor Mensal",
            "Caução",
            "Início Contrato",
            "Fim Contrato",
            "Status IPTU"
        ];

        const csvContent = [
            headers.join(";"),
            ...properties.map(p => [
                p.name,
                p.propertyType,
                p.description,
                p.clientName,
                p.rentValue,
                p.depositValue,
                p.contractStartDate,
                p.contractDueDate,
                p.iptuStatus
            ].join(";"))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "relatorio_imoveis.csv";
        link.click();
    };

    const filteredProperties = properties.filter(prop =>
        prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prop.clientName && prop.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Box>
            {/* Cabeçalho e Botão de Exportar */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1A1A1A' }}>Relatórios</Typography>
                    <Typography variant="body2" color="text.secondary">Gerenciamento financeiro detalhado</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<ExportIcon />}
                    onClick={handleExport}
                    sx={{ bgcolor: '#6C4FFF', borderRadius: '8px', fontWeight: 'bold', textTransform: 'none', '&:hover': { bgcolor: '#5639cc' } }}
                >
                    Exportar Relatório
                </Button>
            </Box>

            {/* Barra de Busca */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', border: '1px solid #f0f0f0' }}>
                <TextField
                    placeholder="Buscar endereço, inquilino..."
                    size="small"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#999' }} />
                            </InputAdornment>
                        )
                    }}
                    sx={{ '& fieldset': { border: 'none' } }}
                />
            </Paper>

            {/* Tabela Estilizada */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: '16px', border: '1px solid #f0f0f0', overflowX: 'auto' }}
            >
                <Table sx={{ minWidth: 1200 }} aria-label="tabela relatorios">
                    <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>Imóvel</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>Endereço</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>Inquilino</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>Valor Mensal</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>Caução</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>Início Contrato</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>Fim Contrato</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>IPTU Status</TableCell>

                            <TableCell sx={{ fontWeight: 'bold', color: '#666' }}>Histórico</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                                    <CircularProgress sx={{ color: '#6C4FFF' }} />
                                </TableCell>
                            </TableRow>
                        ) : filteredProperties.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ py: 3, color: '#999' }}>
                                    Nenhum dado encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProperties.map((prop) => (
                                <TableRow
                                    key={prop.id}
                                    sx={{ '&:hover': { bgcolor: '#F5F7FF' } }}
                                >
                                    {/* Imóvel com Ícone */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: '#F3E5F5',
                                                    color: '#6200EA',
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                <HomeIcon fontSize="small" />
                                            </Avatar>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 'bold', color: '#333' }}
                                            >
                                                {prop.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell>{prop.propertyType || "Casa"}</TableCell>

                                    {/* Endereço Cortado */}
                                    <TableCell
                                        sx={{
                                            maxWidth: 200,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            color: '#555'
                                        }}
                                    >
                                        {prop.description || "-"}
                                    </TableCell>

                                    <TableCell>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {prop.clientName || "Vago"}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Inquilino
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        {prop.rentValue || "R$ 0,00"}
                                    </TableCell>

                                    <TableCell>{prop.depositValue || "-"}</TableCell>

                                    {/* 👉 NOVA COLUNA: Início Contrato */}
                                    <TableCell>{prop.contractStartDate || "-"}</TableCell>

                                    <TableCell>{prop.contractDueDate || "-"}</TableCell>

                                    {/* Status IPTU (Chip) */}
                                    <TableCell>
                                        <Chip
                                            label={prop.iptuStatus || "Pendente"}
                                            size="small"
                                            sx={{
                                                bgcolor: prop.iptuStatus === 'Pago' ? '#E8F5E9' : '#FFEBEE',
                                                color: prop.iptuStatus === 'Pago' ? '#2E7D32' : '#C62828',
                                                fontWeight: 'bold',
                                                borderRadius: '6px',
                                            }}
                                        />
                                    </TableCell>


                                    {/* Histórico com Tooltip */}
                                    <TableCell>
                                        <Tooltip
                                            title={
                                                <Box sx={{ p: 1 }}>
                                                    <Typography variant="caption" display="block">✅ Janeiro: Pago</Typography>
                                                    <Typography variant="caption" display="block">✅ Fevereiro: Pago</Typography>
                                                    <Typography variant="caption" display="block">⚠️ Março: Pendente</Typography>
                                                </Box>
                                            }
                                            arrow
                                            placement="left"
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#6200EA',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                Ver Detalhes
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
