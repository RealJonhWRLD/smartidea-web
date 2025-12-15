import { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    IconButton,
    Grid,
    Button,
    Box,
    MenuItem,
} from '@mui/material';
import {
    Close as CloseIcon,
    MyLocation as MyLocationIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { ClientModal } from '../clients/ClientModal';

// --- DTOS / INTERFACES AUXILIARES ---
interface ContractHistoryItemDTO {
    id: string;
    tenantName: string;
    startDate: string | null;
    endDate: string | null;
    rentValue: number;
    status: string; // // "ACTIVE", "FINISHED", etc.
}

interface Property {
    id: string;
    name: string;
    propertyType: string;
    description: string;

    // dados simples de cliente no cartão
    clientName: string;
    clientPhone: string;

    // ficha completa de inquilino/cliente
    tenantType?: 'PF' | 'PJ';
    tenantCpf?: string;
    tenantRg?: string;
    tenantEmail?: string;
    tenantPhone2?: string;
    tenantSocial?: string;
    tenantBirthDate?: string;
    tenantMaritalStatus?: string;
    tenantProfession?: string;

    companyName?: string;
    companyCnpj?: string;
    legalRepName?: string;
    legalRepCpf?: string;

    // campos do imóvel
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
    contractStartDate?: string;
    monthsLate?: number;
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

// exportado pro ClientModal
export interface ClientForm {
    type: 'PF' | 'PJ';

    // PF
    name: string;
    cpf: string;
    rg: string;
    email: string;
    phone1: string;
    phone2: string;
    social: string;
    birthDate: string;
    maritalStatus: string;
    profession: string;

    // PJ
    companyName: string;
    cnpj: string;
    legalRepName: string;
    legalRepCpf: string;
}

interface TenantDTO {
    id: string;
    name: string;
    tenantType: string;
    tenantCpf: string;
    tenantRg: string;
    tenantEmail: string;
    tenantPhone: string;
    tenantPhone2: string;
    tenantSocial: string;
    tenantBirthDate: string;
    tenantMaritalStatus: string;
    tenantProfession: string;
    companyName: string;
    companyCnpj: string;
    legalRepName: string;
    legalRepCpf: string;
}

// --- Máscaras / helpers ---
const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';
    const floatValue = Number(numericValue) / 100;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(floatValue);
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
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2');
};

const parseBrDate = (str: string | undefined) => {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    if (!d || !m || !y) return null;
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return null;
    return date;
};

// busca contratos do imóvel e traz o ATIVO
async function loadActiveContract(propertyId: string) {
    try {
        const response = await api.get<ContractHistoryItemDTO[]>(
            `/properties/${propertyId}/contracts`,
        );

        const contracts = response.data || [];
        const active = contracts.find(c => c.status === 'ACTIVE');
        return active || null;
    } catch (error) {
        console.error('Erro ao buscar contratos do imóvel:', error);
        return null;
    }
}

export function PropertyModal({
                                  open,
                                  onClose,
                                  onSaveSuccess,
                                  propertyToEdit,
                                  initialLat,
                                  initialLng,
                                  initialAddress,
                              }: PropertyModalProps) {
    const descriptionInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Property>({
        id: '',
        name: '',
        propertyType: 'Casa',
        description: '',
        clientName: '',
        clientPhone: '',

        tenantType: 'PF',
        tenantCpf: '',
        tenantRg: '',
        tenantEmail: '',
        tenantPhone2: '',
        tenantSocial: '',
        tenantBirthDate: '',
        tenantMaritalStatus: '',
        tenantProfession: '',

        companyName: '',
        companyCnpj: '',
        legalRepName: '',
        legalRepCpf: '',

        matricula: '',
        cagece: '',
        enel: '',
        lastRenovation: '',
        propertyStatus: 'Disponível',
        rentValue: '',
        condoValue: '',
        depositValue: '',
        iptuStatus: 'Pago',
        rentDueDate: '05',
        contractDueDate: '',
        contractMonths: '',
        rentPaymentStatus: 'em_dia',
        notes: '',
        lat: 0,
        lng: 0,
        contractStartDate: '',
        monthsLate: 0,
    });

    const [clientForm, setClientForm] = useState<ClientForm>({
        type: 'PF',
        name: '',
        cpf: '',
        rg: '',
        email: '',
        phone1: '',
        phone2: '',
        social: '',
        birthDate: '',
        maritalStatus: '',
        profession: '',
        companyName: '',
        cnpj: '',
        legalRepName: '',
        legalRepCpf: '',
    });

    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    const openClientModal = () => {
        setClientForm(prev => ({
            ...prev,
            name: formData.clientName || prev.name,
            phone1: formData.clientPhone || prev.phone1,
        }));
        setIsClientModalOpen(true);
    };

    const handleSaveClientFromModal = () => {
        setFormData(prev => ({
            ...prev,
            clientName:
                clientForm.type === 'PJ'
                    ? clientForm.companyName || clientForm.name
                    : clientForm.name,
            clientPhone: clientForm.phone1,

            tenantType: clientForm.type,
            tenantCpf: clientForm.cpf,
            tenantRg: clientForm.rg,
            tenantEmail: clientForm.email,
            tenantPhone2: clientForm.phone2,
            tenantSocial: clientForm.social,
            tenantBirthDate: clientForm.birthDate,
            tenantMaritalStatus: clientForm.maritalStatus,
            tenantProfession: clientForm.profession,

            companyName: clientForm.companyName,
            companyCnpj: clientForm.cnpj,
            legalRepName: clientForm.legalRepName,
            legalRepCpf: clientForm.legalRepCpf,
        }));

        setIsClientModalOpen(false);
    };

    const handleClientFormChange = (updated: ClientForm) => {
        setClientForm(updated);
    };

    // carregar dados quando abrir o modal
    useEffect(() => {
        if (!open) return;

        if (propertyToEdit) {
            setFormData({
                ...propertyToEdit,
                rentValue: propertyToEdit.rentValue
                    ? formatCurrency(propertyToEdit.rentValue)
                    : '',
                condoValue: propertyToEdit.condoValue
                    ? formatCurrency(propertyToEdit.condoValue)
                    : '',
                depositValue: propertyToEdit.depositValue
                    ? formatCurrency(propertyToEdit.depositValue)
                    : '',
                rentDueDate: propertyToEdit.rentDueDate
                    ? propertyToEdit.rentDueDate.toString().padStart(2, '0')
                    : '05',
                propertyType: propertyToEdit.propertyType || 'Casa',
                propertyStatus: propertyToEdit.propertyStatus || 'Disponível',
                iptuStatus: propertyToEdit.iptuStatus || 'Pago',
                contractStartDate: propertyToEdit.contractStartDate || '',
                monthsLate:
                    propertyToEdit.monthsLate !== undefined
                        ? propertyToEdit.monthsLate
                        : 0,
                tenantType: propertyToEdit.tenantType || 'PF',
            });

            setClientForm({
                type: (propertyToEdit.tenantType as 'PF' | 'PJ') || 'PF',
                name: propertyToEdit.clientName || '',
                cpf: propertyToEdit.tenantCpf || '',
                rg: propertyToEdit.tenantRg || '',
                email: propertyToEdit.tenantEmail || '',
                phone1: propertyToEdit.clientPhone || '',
                phone2: propertyToEdit.tenantPhone2 || '',
                social: propertyToEdit.tenantSocial || '',
                birthDate: propertyToEdit.tenantBirthDate || '',
                maritalStatus: propertyToEdit.tenantMaritalStatus || '',
                profession: propertyToEdit.tenantProfession || '',
                companyName: propertyToEdit.companyName || '',
                cnpj: propertyToEdit.companyCnpj || '',
                legalRepName: propertyToEdit.legalRepName || '',
                legalRepCpf: propertyToEdit.legalRepCpf || '',
            });

            // carrega contrato ativo só pra exibição
            loadActiveContract(propertyToEdit.id).then(active => {
                if (!active) return;

                setFormData(prev => ({
                    ...prev,
                    clientName: active.tenantName || prev.clientName,
                    rentValue: active.rentValue
                        ? formatCurrency(String(active.rentValue))
                        : prev.rentValue,
                    contractStartDate: active.startDate || prev.contractStartDate,
                    contractDueDate: active.endDate || prev.contractDueDate,
                }));

                setClientForm(prev => ({
                    ...prev,
                    name: active.tenantName || prev.name,
                }));
            });
        } else {
            // novo imóvel
            setFormData({
                id: '',
                name: '',
                propertyType: 'Casa',
                description: initialAddress || '',
                clientName: '',
                clientPhone: '',
                tenantType: 'PF',
                tenantCpf: '',
                tenantRg: '',
                tenantEmail: '',
                tenantPhone2: '',
                tenantSocial: '',
                tenantBirthDate: '',
                tenantMaritalStatus: '',
                tenantProfession: '',
                companyName: '',
                companyCnpj: '',
                legalRepName: '',
                legalRepCpf: '',
                matricula: '',
                cagece: '',
                enel: '',
                lastRenovation: '',
                propertyStatus: 'Disponível',
                rentValue: '',
                condoValue: '',
                depositValue: '',
                iptuStatus: 'Pago',
                rentDueDate: '05',
                contractDueDate: '',
                contractMonths: '',
                rentPaymentStatus: 'em_dia',
                notes: '',
                lat: initialLat || 0,
                lng: initialLng || 0,
                contractStartDate: '',
                monthsLate: 0,
            });

            setClientForm({
                type: 'PF',
                name: '',
                cpf: '',
                rg: '',
                email: '',
                phone1: '',
                phone2: '',
                social: '',
                birthDate: '',
                maritalStatus: '',
                profession: '',
                companyName: '',
                cnpj: '',
                legalRepName: '',
                legalRepCpf: '',
            });
        }
    }, [open, propertyToEdit, initialLat, initialLng, initialAddress]);

    // cálculo automático dos meses de contrato
    useEffect(() => {
        const start = parseBrDate(formData.contractStartDate);
        const end = parseBrDate(formData.contractDueDate);

        if (!start || !end || end < start) {
            setFormData(prev => ({
                ...prev,
                contractMonths: '',
            }));
            return;
        }

        const years = end.getFullYear() - start.getFullYear();
        const months = end.getMonth() - start.getMonth();
        const totalMonths = years * 12 + months + 1;

        setFormData(prev => ({
            ...prev,
            contractMonths: totalMonths > 0 ? String(totalMonths) : '',
        }));
    }, [formData.contractStartDate, formData.contractDueDate]);

    const handleSave = async () => {
        try {
            //Monta payload do IMÓVEL (somente imóvel)
            const propertyPayload = {
                name: formData.name,
                propertyType: formData.propertyType,
                description: formData.description,
                matricula: formData.matricula,
                cagece: formData.cagece,
                enel: formData.enel,
                lastRenovation: formData.lastRenovation,
                propertyStatus: formData.propertyStatus,
                iptuStatus: formData.iptuStatus,
                notes: formData.notes,
                lat: formData.lat,
                lng: formData.lng,
            };

            // Cria ou atualiza o IMÓVEL
            if (formData.id) {
                await api.put(`/properties/${formData.id}`, propertyPayload);
            } else {
                await api.post('/properties', propertyPayload);
            }

            // Contrato (vínculo) será criado na tela de inquilinos via POST /contracts com tenantId + propertyId

            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar imóvel:', error);
            alert('Erro ao salvar dados do imóvel. Veja o console para detalhes.');
        }
    };

    const SectionTitle = ({ title }: { title: string }) => (
        <Grid item xs={12} sx={{ mt: 1, mb: 0 }}>
            <Typography
                variant="subtitle2"
                sx={{
                    color: '#6C4FFF',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                }}
            >
                {title}
            </Typography>
        </Grid>
    );

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                scroll="paper"
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        margin: 2,
                        width: '100%',
                        maxHeight: '90vh',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 3,
                        px: 4,
                    }}
                >
                    <Typography variant="h5" fontWeight="800" color="#1a1a1a">
                        {formData.id ? 'Editar Imóvel' : 'Novo Imóvel'}
                    </Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: '#999' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent className="custom-scrollbar-content" sx={{ px: 4, pb: 4 }}>
                    <Box sx={{ mt: 4 }}>
                        <Grid container spacing={3}>
                            {/* DADOS DO IMÓVEL */}
                            <SectionTitle title="Dados do Imóvel" />

                            <Grid item xs={12} sm={8}>
                                <TextField
                                    label="Endereço Principal"
                                    placeholder="Rua, Número..."
                                    fullWidth
                                    multiline
                                    maxRows={2}
                                    value={formData.name}
                                    onChange={e =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Tipo de Endereço"
                                    select
                                    fullWidth
                                    value={formData.propertyType}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            propertyType: e.target.value,
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                >
                                    {['Casa', 'Comercial', 'Galpão', 'Salas', 'Terreno', 'Outro'].map(
                                        t => (
                                            <MenuItem key={t} value={t}>
                                                {t}
                                            </MenuItem>
                                        ),
                                    )}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Matrícula"
                                    fullWidth
                                    value={formData.matricula}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            matricula: e.target.value,
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Status do Imóvel"
                                    select
                                    fullWidth
                                    value={formData.propertyStatus}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            propertyStatus: e.target.value,
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                >
                                    <MenuItem value="Disponível">Disponível</MenuItem>
                                    <MenuItem value="Alugado">Alugado</MenuItem>
                                    <MenuItem value="Manutenção">Manutenção</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Status IPTU"
                                    select
                                    fullWidth
                                    value={formData.iptuStatus}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            iptuStatus: e.target.value,
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                >
                                    <MenuItem value="Pago">Pago</MenuItem>
                                    <MenuItem value="Pendente">Pendente</MenuItem>
                                    <MenuItem value="Isento">Isento</MenuItem>
                                </TextField>
                            </Grid>

                            {/* CLIENTE */}
                            <SectionTitle title="Inquilino / Cliente" />

                            <Grid item xs={12} sm={6}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <TextField
                                        label="Nome do Cliente"
                                        fullWidth
                                        value={formData.clientName}
                                        onChange={e =>
                                            setFormData({
                                                ...formData,
                                                clientName: e.target.value,
                                            })
                                        }
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ flex: 1 }}
                                    />
                                    <IconButton
                                        aria-label="Editar cliente"
                                        onClick={openClientModal}
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Telefone"
                                    fullWidth
                                    value={formData.clientPhone}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            clientPhone: maskPhone(e.target.value),
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ maxLength: 15 }}
                                />
                            </Grid>

                            {/* FINANCEIRO */}
                            <SectionTitle title="Financeiro" />

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Valor Aluguel"
                                    fullWidth
                                    placeholder="R$ 0,00"
                                    value={formData.rentValue}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            rentValue: formatCurrency(e.target.value),
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Condomínio"
                                    fullWidth
                                    placeholder="R$ 0,00"
                                    value={formData.condoValue}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            condoValue: formatCurrency(e.target.value),
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Calção (Valor)"
                                    fullWidth
                                    placeholder="R$ 0,00"
                                    value={formData.depositValue}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            depositValue: formatCurrency(e.target.value),
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            {/* CONTRATO (somente visual, contrato real é outra tela) */}
                            <SectionTitle title="Contrato" />

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Dia Venc."
                                    select
                                    fullWidth
                                    value={formData.rentDueDate}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            rentDueDate: e.target.value,
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                >
                                    {[5, 10, 15, 20, 25].map(day => (
                                        <MenuItem key={day} value={day.toString().padStart(2, '0')}>
                                            {day}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Início do Contrato"
                                    placeholder="DD/MM/AAAA"
                                    fullWidth
                                    value={formData.contractStartDate || ''}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            contractStartDate: maskDate(e.target.value),
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Venc. Contrato"
                                    placeholder="DD/MM/AAAA"
                                    fullWidth
                                    value={formData.contractDueDate}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            contractDueDate: maskDate(e.target.value),
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Meses de Contrato"
                                    fullWidth
                                    value={formData.contractMonths}
                                    InputProps={{ readOnly: true }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Meses em atraso"
                                    type="number"
                                    fullWidth
                                    value={formData.monthsLate ?? 0}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            monthsLate: Number(e.target.value) || 0,
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            {/* MEDIDORES & DETALHES */}
                            <SectionTitle title="Medidores & Detalhes" />

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Medidor Cagece"
                                    fullWidth
                                    value={formData.cagece}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            cagece: e.target.value,
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Medidor Enel"
                                    fullWidth
                                    value={formData.enel}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            enel: e.target.value,
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Última Reforma"
                                    placeholder="DD/MM/AAAA"
                                    fullWidth
                                    value={formData.lastRenovation}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            lastRenovation: maskDate(e.target.value),
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Observação"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={formData.notes}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    inputRef={descriptionInputRef}
                                    label="Detalhes / Endereço Completo"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={formData.description}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        bgcolor: '#f8f9fa',
                                        p: 1.5,
                                        borderRadius: '12px',
                                        border: '1px dashed #ddd',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: 1.5,
                                    }}
                                >
                                    <MyLocationIcon sx={{ fontSize: 18, color: '#6C4FFF' }} />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#555',
                                            fontFamily: 'monospace',
                                            fontSize: '0.85rem',
                                        }}
                                    >
                                        GPS: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 3,
                        pt: 2,
                        borderTop: '1px solid #f9f9f9',
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                fullWidth
                                sx={{
                                    color: '#666',
                                    borderColor: '#ddd',
                                    borderRadius: '12px',
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    '&:hover': { borderColor: '#bbb', bgcolor: '#f5f5f5' },
                                }}
                            >
                                Cancelar
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                onClick={handleSave}
                                variant="contained"
                                fullWidth
                                disableElevation
                                sx={{
                                    bgcolor: '#6C4FFF',
                                    borderRadius: '12px',
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(108, 79, 255, 0.2)',
                                    '&:hover': { bgcolor: '#5639cc' },
                                }}
                            >
                                {formData.id ? 'Salvar Alterações' : 'Cadastrar'}
                            </Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>

            <ClientModal
                open={isClientModalOpen}
                form={clientForm}
                onChange={handleClientFormChange}
                onClose={() => setIsClientModalOpen(false)}
                onSave={handleSaveClientFromModal}
            />
        </>
    );
}
