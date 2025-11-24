import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Typography, IconButton, Grid, Button, Box, MenuItem, Divider
} from '@mui/material';
import { Close as CloseIcon, MyLocation as MyLocationIcon } from '@mui/icons-material';
import api from '../../services/api';

// --- INTERFACE ---
interface Property {
    id: string;
    name: string;
    propertyType: string;
    description: string;
    clientName: string;
    clientPhone: string;
    matricula: string;
    cagece: string;
    enel: string;
    lastRenovation: string;
    propertyStatus: string;
    rentValue: string;
    condoValue: string;
    depositValue: string;
    iptuStatus: string;
    rentDueDate: string;
    contractDueDate: string;
    contractMonths: string;
    rentPaymentStatus: string;
    notes: string;
    lat: number;
    lng: number;
}

interface PropertyModalProps {
    open: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    propertyToEdit?: Property | null;
    initialLat?: number;
    initialLng?: number;
    initialAddress?: string;
}

// --- Máscaras ---
const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const floatValue = Number(numericValue) / 100;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(floatValue);
};

const maskDate = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
};

const maskPhone = (value: string) => {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d)(\d{4})$/, "$1-$2");
};

export function PropertyModal({ open, onClose, onSaveSuccess, propertyToEdit, initialLat, initialLng, initialAddress }: PropertyModalProps) {
    const descriptionInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Property>({
        id: '', name: '', propertyType: 'Casa', description: '',
        clientName: '', clientPhone: '',
        matricula: '', cagece: '', enel: '', lastRenovation: '', propertyStatus: 'Disponível',
        rentValue: '', condoValue: '', depositValue: '', iptuStatus: 'Pago',
        rentDueDate: '05', contractDueDate: '', contractMonths: '', rentPaymentStatus: 'em_dia',
        notes: '', lat: 0, lng: 0
    });

    useEffect(() => {
        if (open) {
            if (propertyToEdit) {
                setFormData({
                    ...propertyToEdit,
                    rentValue: propertyToEdit.rentValue ? formatCurrency(propertyToEdit.rentValue) : '',
                    condoValue: propertyToEdit.condoValue ? formatCurrency(propertyToEdit.condoValue) : '',
                    depositValue: propertyToEdit.depositValue ? formatCurrency(propertyToEdit.depositValue) : '',
                    rentDueDate: propertyToEdit.rentDueDate ? propertyToEdit.rentDueDate.toString().padStart(2, '0') : '05',
                    propertyType: propertyToEdit.propertyType || 'Casa',
                    propertyStatus: propertyToEdit.propertyStatus || 'Disponível',
                    iptuStatus: propertyToEdit.iptuStatus || 'Pago'
                });
            } else {
                setFormData({
                    id: '', name: '', propertyType: 'Casa', description: initialAddress || '',
                    clientName: '', clientPhone: '',
                    matricula: '', cagece: '', enel: '', lastRenovation: '', propertyStatus: 'Disponível',
                    rentValue: '', condoValue: '', depositValue: '', iptuStatus: 'Pago',
                    rentDueDate: '05', contractDueDate: '', contractMonths: '', rentPaymentStatus: 'em_dia',
                    notes: '',
                    lat: initialLat || 0, lng: initialLng || 0
                });
            }
        }
    }, [open, propertyToEdit, initialLat, initialLng, initialAddress]);

    const handleSave = async () => {
        try {
            if (formData.id) {
                await api.put(`/properties/${formData.id}`, formData);
                alert("Imóvel atualizado!");
            } else {
                await api.post('/properties', formData);
                alert("Imóvel cadastrado!");
            }
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        }
    };

    // Helper para Título de Seção (Roxo e Moderno)
    const SectionTitle = ({ title }: { title: string }) => (
        <Grid item xs={12} sx={{ mt: 1, mb: 0 }}>
            <Typography variant="subtitle2" sx={{ color: '#6C4FFF', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                {title}
            </Typography>
        </Grid>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            scroll="paper"
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: '24px', margin: 2, width: '100%', maxHeight: '90vh' } }}
        >
            <DialogTitle sx={{ borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 3, px: 4 }}>
                <Typography variant="h5" fontWeight="800" color="#1a1a1a">
                    {formData.id ? 'Editar Imóvel' : 'Novo Imóvel'}
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: '#999' }}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent className="custom-scrollbar-content" sx={{ px: 4, pb: 4 }}>

                {/* 👇 A SOLUÇÃO: ESPAÇADOR FÍSICO NO TOPO 👇 */}
                <Box sx={{ mt: 4 }}>

                    <Grid container spacing={3}>

                        {/* 1. DADOS DO IMÓVEL */}
                        <SectionTitle title="Dados do Imóvel" />

                        {/* Endereço Principal - Com Label Shrink forçado */}
                        <Grid item xs={12} sm={8}>
                            <TextField
                                label="Endereço Principal"
                                placeholder="Rua, Número..."
                                fullWidth
                                multiline
                                maxRows={2}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField label="Tipo de Endereço" select fullWidth value={formData.propertyType} onChange={(e) => setFormData({...formData, propertyType: e.target.value})} InputLabelProps={{ shrink: true }}>
                                {['Casa', 'Comercial', 'Galpão', 'Salas', 'Terreno', 'Outro'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Matrícula" fullWidth value={formData.matricula} onChange={(e) => setFormData({...formData, matricula: e.target.value})} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Status do Imóvel" select fullWidth value={formData.propertyStatus} onChange={(e) => setFormData({...formData, propertyStatus: e.target.value})} InputLabelProps={{ shrink: true }}>
                                <MenuItem value="Disponível">Disponível</MenuItem>
                                <MenuItem value="Alugado">Alugado</MenuItem>
                                <MenuItem value="Manutenção">Manutenção</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Status IPTU" select fullWidth value={formData.iptuStatus} onChange={(e) => setFormData({...formData, iptuStatus: e.target.value})} InputLabelProps={{ shrink: true }}>
                                <MenuItem value="Pago">Pago</MenuItem><MenuItem value="Pendente">Pendente</MenuItem><MenuItem value="Isento">Isento</MenuItem>
                            </TextField>
                        </Grid>

                        {/* 2. CLIENTE */}
                        <SectionTitle title="Inquilino / Cliente" />
                        <Grid item xs={12} sm={6}>
                            <TextField label="Nome do Cliente" fullWidth value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Telefone" fullWidth value={formData.clientPhone} onChange={(e) => setFormData({...formData, clientPhone: maskPhone(e.target.value)})} InputLabelProps={{ shrink: true }} inputProps={{ maxLength: 15 }} />
                        </Grid>

                        {/* 3. FINANCEIRO */}
                        <SectionTitle title="Financeiro" />
                        <Grid item xs={12} sm={4}>
                            <TextField label="Valor Aluguel" fullWidth placeholder="R$ 0,00" value={formData.rentValue} onChange={(e) => setFormData({...formData, rentValue: formatCurrency(e.target.value)})} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Condomínio" fullWidth placeholder="R$ 0,00" value={formData.condoValue} onChange={(e) => setFormData({...formData, condoValue: formatCurrency(e.target.value)})} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Calção (Valor)" fullWidth placeholder="R$ 0,00" value={formData.depositValue} onChange={(e) => setFormData({...formData, depositValue: formatCurrency(e.target.value)})} InputLabelProps={{ shrink: true }} />
                        </Grid>

                        {/* 4. CONTRATO */}
                        <SectionTitle title="Contrato" />
                        <Grid item xs={6} sm={4}>
                            <TextField label="Dia Venc." select fullWidth value={formData.rentDueDate} onChange={(e) => setFormData({...formData, rentDueDate: e.target.value})} InputLabelProps={{ shrink: true }}>
                                {[5, 10, 15, 20, 25].map(day => <MenuItem key={day} value={day.toString().padStart(2, '0')}>{day}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                            <TextField label="Venc. Contrato" placeholder="DD/MM/AAAA" fullWidth value={formData.contractDueDate} onChange={(e) => setFormData({...formData, contractDueDate: maskDate(e.target.value)})} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField label="Meses Contrato" type="number" fullWidth value={formData.contractMonths} onChange={(e) => setFormData({...formData, contractMonths: e.target.value})} InputLabelProps={{ shrink: true }} />
                        </Grid>

                        {/* 5. MEDIDORES & EXTRAS */}
                        <SectionTitle title="Medidores & Detalhes" />
                        <Grid item xs={6}>
                            <TextField label="Medidor Cagece" fullWidth value={formData.cagece} onChange={(e) => setFormData({...formData, cagece: e.target.value})} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Medidor Enel" fullWidth value={formData.enel} onChange={(e) => setFormData({...formData, enel: e.target.value})} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Última Reforma" placeholder="DD/MM/AAAA" fullWidth value={formData.lastRenovation} onChange={(e) => setFormData({...formData, lastRenovation: maskDate(e.target.value)})} InputLabelProps={{ shrink: true }} />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField label="Observação" fullWidth multiline rows={2} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} InputLabelProps={{ shrink: true }} />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField inputRef={descriptionInputRef} label="Detalhes / Endereço Completo" fullWidth multiline rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} InputLabelProps={{ shrink: true }} />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ bgcolor: '#f8f9fa', p: 1.5, borderRadius: '12px', border: '1px dashed #ddd', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
                                <MyLocationIcon sx={{ fontSize: 18, color: '#6C4FFF' }} />
                                <Typography variant="caption" sx={{ color: '#555', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    GPS: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                                </Typography>
                            </Box>
                        </Grid>

                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #f9f9f9' }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}><Button onClick={onClose} variant="outlined" fullWidth sx={{ color: '#666', borderColor: '#ddd', borderRadius: '12px', py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { borderColor: '#bbb', bgcolor: '#f5f5f5' } }}>Cancelar</Button></Grid>
                    <Grid item xs={6}><Button onClick={handleSave} variant="contained" fullWidth disableElevation sx={{ bgcolor: '#6C4FFF', borderRadius: '12px', py: 1.5, fontWeight: 'bold', textTransform: 'none', boxShadow: '0 4px 12px rgba(108, 79, 255, 0.2)', '&:hover': { bgcolor: '#5639cc' } }}>{formData.id ? 'Salvar Alterações' : 'Cadastrar'}</Button></Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
}