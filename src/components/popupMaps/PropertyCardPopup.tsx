import { Box, Typography, Divider, IconButton, Tooltip, Chip, Grid, CircularProgress, Button } from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    HomeWork as BuildingIcon,
    AddLocationAlt as AddLocationIcon
} from '@mui/icons-material';
import api from '../../services/api';

interface PopupProps {
    title: string;
    description: string;
    clientName?: string;
    matricula?: string;
    rentValue?: string;
    rentDueDate?: string;
    contractDueDate?: string;
    iptuStatus?: string;
    rentPaymentStatus?: string;
    loading?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onAction?: () => void;
    actionLabel?: string;
}

export function PropertyCardPopup({
                                      title, description, clientName,
                                      matricula, rentValue, rentDueDate, contractDueDate, iptuStatus, rentPaymentStatus,
                                      loading, onAction, actionLabel, onEdit, onDelete
                                  }: PopupProps) {

    if (loading) {
        return (
            <Box sx={{ p: 2, minWidth: 200, textAlign: 'center' }}>
                <CircularProgress size={20} sx={{ color: '#6C4FFF' }} />
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>Carregando...</Typography>
            </Box>
        );
    }

    const [mainAddress] = description ? description.split(' - ') : ["Endereço não informado"];
    const fullAddress = description || "Sem endereço informado";

    return (
        <Box sx={{ width: 300, fontFamily: '"Inter", "Roboto", sans-serif', p: 1 }}>

            {/* CABEÇALHO */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#2D2D2D', fontSize: '1.1rem' }}>{title}</Typography>
                    <Typography variant="caption" sx={{ color: '#757575', fontSize: '0.75rem', mt: 0.5, display: 'block' }}>Matrícula: {matricula || '---'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0 }}>
                    {onEdit && <Tooltip title="Editar"><IconButton size="small" onClick={onEdit} sx={{ p: 0.5 }}><EditIcon sx={{ fontSize: 18, color: '#6200EA' }} /></IconButton></Tooltip>}
                    {onDelete && <Tooltip title="Excluir"><IconButton size="small" onClick={onDelete} sx={{ p: 0.5 }}><DeleteIcon sx={{ fontSize: 18, color: '#6200EA' }} /></IconButton></Tooltip>}
                </Box>
            </Box>

            {/* CAIXA DE VALOR */}
            {onEdit ? (
                <>
                    <Box sx={{ background: 'linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%)', borderRadius: '12px', p: 2, mb: 3, color: 'white', boxShadow: '0 4px 12px rgba(98, 0, 234, 0.25)' }}>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem', fontWeight: 500, display: 'block' }}>Valor Aluguel</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, letterSpacing: '-0.5px' }}>{rentValue || 'R$ 0,00'}</Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={7}>
                            <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5 }}>Inquilino / Cliente</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PersonIcon sx={{ fontSize: 16, color: '#6200EA' }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clientName || "Vago"}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={5}>
                            <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5, textAlign: 'right' }}>Venc. Aluguel</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                <CalendarIcon sx={{ fontSize: 14, color: '#666' }} />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '0.8rem' }}>Dia {rentDueDate || '--'}</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Grid item xs={4}><Typography variant="caption" sx={{ color: '#999', display: 'block', fontSize: '0.7rem', mb: 0.5 }}>Venc. Contrato</Typography><Typography variant="caption" sx={{ fontWeight: 600, color: '#333', fontSize: '0.8rem' }}>{contractDueDate || '--/--'}</Typography></Grid>
                        <Grid item xs={4} sx={{ textAlign: 'center' }}><Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>Status IPTU</Typography><Chip label={iptuStatus || "---"} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: iptuStatus === 'Pago' ? '#6200EA' : '#FFEBEE', color: iptuStatus === 'Pago' ? 'white' : '#D32F2F' }} /></Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}><Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>Status Aluguel</Typography><Chip label={rentPaymentStatus === 'atrasado' ? 'Atrasado' : (rentValue ? 'Em dia' : 'Sem info')} size="small" sx={{ height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#F3E5F5', color: '#6200EA' }} /></Grid>
                    </Grid>
                </>
            ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>{description}</Typography>
                    <Typography variant="caption" color="text.secondary">Clique abaixo para cadastrar.</Typography>
                </Box>
            )}

            <Divider sx={{ my: 1.5, borderColor: '#eee' }} />

            {onEdit ? (
                <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', lineHeight: 1.4, display: 'block', px: 0.5 }}>{fullAddress}</Typography>
            ) : (
                onAction && <Button fullWidth size="small" variant="contained" disableElevation onClick={onAction} sx={{ textTransform: 'none', borderRadius: '8px', bgcolor: '#6200EA', fontWeight: 'bold' }}>{actionLabel}</Button>
            )}
        </Box>
    );
}