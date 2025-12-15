import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
} from '@mui/material';
import api from '../../services/api';
import { ContractsService } from '../../services/contracts';

interface TenantDTO {
    id: string;
    name: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    propertyId: string;
}

export function LinkContractModal({ open, onClose, onSuccess, propertyId }: Props) {
    const [tenants, setTenants] = useState<TenantDTO[]>([]);
    const [loadingTenants, setLoadingTenants] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        tenantId: '',
        rentValue: '',
        startDate: '',
        endDate: '',
        paymentDay: '05',
        notes: '',
    });

    // reset + load tenants ao abrir
    useEffect(() => {
        if (!open) return;

        setForm({
            tenantId: '',
            rentValue: '',
            startDate: '',
            endDate: '',
            paymentDay: '05',
            notes: '',
        });

        setLoadingTenants(true);
        api
            .get<TenantDTO[]>('/tenants')
            .then((res) => setTenants(res.data))
            .catch(() => setTenants([]))
            .finally(() => setLoadingTenants(false));
    }, [open]);

    const handleSave = async () => {
        try {
            setSaving(true);

            await ContractsService.create({
                propertyId,
                tenantId: form.tenantId,
                rentValue: Number(form.rentValue),
                paymentDay: Number(form.paymentDay),
                startDate: form.startDate,
                endDate: form.endDate || undefined,
                notes: form.notes || undefined,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            if (err?.response?.status === 409) {
                alert('Já existe contrato ativo para este imóvel.');
                return;
            }
            console.error(err);
            alert('Erro ao criar contrato.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Vincular inquilino (Criar contrato)</DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Grid container spacing={2} mt={0.5}>
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Inquilino"
                            value={form.tenantId}
                            onChange={(e) => handleChange('tenantId', e.target.value)}
                            disabled={loadingTenants}
                            helperText={loadingTenants ? 'Carregando inquilinos...' : ' '}
                        >
                            {tenants.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Valor do aluguel"
                            placeholder="Ex: R$ 2000,00"
                            value={form.rentValue}
                            onChange={(e) => handleChange('rentValue', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Dia do pagamento"
                            value={form.paymentDay}
                            onChange={(e) => handleChange('paymentDay', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Início do contrato"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={form.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Fim do contrato"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={form.endDate}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Observações"
                            value={form.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            multiline
                            minRows={2}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={!form.tenantId || !propertyId || saving}
                >
                    {saving ? 'Salvando...' : 'Criar contrato'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
