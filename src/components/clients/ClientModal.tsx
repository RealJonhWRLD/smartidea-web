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
    MenuItem,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { ClientForm } from '../popupMaps/PropertyModal';

// Máscara de data DD/MM/AAAA
const maskDate = (value: string) => {
    let v = value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
};

// Celular BR (11 dígitos): (99) 99999-9999
const maskCellphone = (value: string) => {
    return value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d{4})$/, '$1-$2');
};

// CNPJ: 00.000.000/0000-00
const maskCnpj = (value: string) => {
    return value
        .replace(/\D/g, '')
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
};

interface ClientModalProps {
    open: boolean;
    form: ClientForm;
    onChange: (form: ClientForm) => void;
    onClose: () => void;
    onSave: () => void;
}

export function ClientModal({ open, form, onChange, onClose, onSave }: ClientModalProps) {
    const updateField = (field: keyof ClientForm, value: string) => {
        onChange({
            ...form,
            [field]: value,
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            scroll="paper"
            PaperProps={{
                sx: {
                    position: 'absolute',
                    top: '10vh',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    m: 0,
                    borderRadius: '24px',
                    maxHeight: '80vh',
                },
            }}
        >
            <DialogTitle
                sx={{
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2.5,
                    px: 3,
                }}
            >
                <Typography variant="h6" fontWeight="700">
                    Editar Cliente
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: '#999' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 3 }}>
                <Grid container spacing={2.5} sx={{ pt: 3 }}>
                    {/* PRIMEIRA LINHA: Tipo de inquilino + Nome (PF) ou Empresa (PJ) */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Tipo de inquilino"
                            select
                            fullWidth
                            value={form.type}
                            onChange={(e) =>
                                updateField('type', e.target.value as 'PF' | 'PJ')
                            }
                            InputLabelProps={{ shrink: true }}
                        >
                            <MenuItem value="PF">Pessoa Física</MenuItem>
                            <MenuItem value="PJ">Empresa</MenuItem>
                        </TextField>
                    </Grid>

                    {form.type === 'PF' ? (
                        <Grid item xs={12} sm={8}>
                            <TextField
                                label="Nome completo"
                                fullWidth
                                value={form.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    ) : (
                        <Grid item xs={12} sm={8}>
                            <TextField
                                label="Nome da empresa"
                                fullWidth
                                value={form.companyName}
                                onChange={(e) =>
                                    updateField('companyName', e.target.value)
                                }
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    )}

                    {/* CAMPOS PESSOA FÍSICA */}
                    {form.type === 'PF' && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="CPF"
                                    fullWidth
                                    value={form.cpf}
                                    onChange={(e) =>
                                        updateField('cpf', e.target.value)
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="RG"
                                    fullWidth
                                    value={form.rg}
                                    onChange={(e) =>
                                        updateField('rg', e.target.value)
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </>
                    )}

                    {/* CAMPOS PJ */}
                    {form.type === 'PJ' && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="CNPJ"
                                    fullWidth
                                    value={form.cnpj}
                                    onChange={(e) =>
                                        updateField('cnpj', maskCnpj(e.target.value))
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Telefone"
                                    fullWidth
                                    value={form.phone1}
                                    onChange={(e) =>
                                        updateField(
                                            'phone1',
                                            maskCellphone(e.target.value),
                                        )
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </>
                    )}

                    {/* CAMPOS COMUNS (PF e PJ) */}
                    <Grid item xs={12}>
                        <TextField
                            label="E-mail"
                            type="email"
                            fullWidth
                            value={form.email}
                            onChange={(e) =>
                                updateField('email', e.target.value)
                            }
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {form.type === 'PF' && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Telefone 1"
                                    fullWidth
                                    value={form.phone1}
                                    onChange={(e) =>
                                        updateField(
                                            'phone1',
                                            maskCellphone(e.target.value),
                                        )
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Telefone 2"
                                    fullWidth
                                    value={form.phone2}
                                    onChange={(e) =>
                                        updateField(
                                            'phone2',
                                            maskCellphone(e.target.value),
                                        )
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12}>
                        <TextField
                            label="Redes sociais"
                            fullWidth
                            placeholder="@instagram, @linkedin..."
                            value={form.social}
                            onChange={(e) =>
                                updateField('social', e.target.value)
                            }
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {form.type === 'PF' && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Data de nascimento"
                                    fullWidth
                                    placeholder="DD/MM/AAAA"
                                    value={form.birthDate}
                                    onChange={(e) =>
                                        updateField(
                                            'birthDate',
                                            maskDate(e.target.value),
                                        )
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Estado civil"
                                    fullWidth
                                    value={form.maritalStatus}
                                    onChange={(e) =>
                                        updateField(
                                            'maritalStatus',
                                            e.target.value,
                                        )
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Profissão"
                                    fullWidth
                                    value={form.profession}
                                    onChange={(e) =>
                                        updateField(
                                            'profession',
                                            e.target.value,
                                        )
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </>
                    )}

                    {form.type === 'PJ' && (
                        <>
                            <Grid item xs={12}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: '#6C4FFF',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.5px',
                                        mt: 1,
                                    }}
                                >
                                    Representante legal
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Nome do representante legal"
                                    fullWidth
                                    value={form.legalRepName}
                                    onChange={(e) =>
                                        updateField(
                                            'legalRepName',
                                            e.target.value,
                                        )
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="CPF do representante"
                                    fullWidth
                                    value={form.legalRepCpf}
                                    onChange={(e) =>
                                        updateField(
                                            'legalRepCpf',
                                            e.target.value,
                                        )
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Estado civil"
                                    fullWidth
                                    value={form.maritalStatus}
                                    onChange={(e) =>
                                        updateField(
                                            'maritalStatus',
                                            e.target.value,
                                        )
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Profissão"
                                    fullWidth
                                    value={form.profession}
                                    onChange={(e) =>
                                        updateField(
                                            'profession',
                                            e.target.value,
                                        )
                                    }
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
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
                                py: 1.2,
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
                            onClick={onSave}
                            variant="contained"
                            fullWidth
                            disableElevation
                            sx={{
                                bgcolor: '#6C4FFF',
                                borderRadius: '12px',
                                py: 1.2,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(108, 79, 255, 0.2)',
                                '&:hover': { bgcolor: '#5639cc' },
                            }}
                        >
                            Salvar Cliente
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
}
