import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, IconButton, Typography,
    InputAdornment, Avatar, Box
} from '@mui/material';
import {
    Close as CloseIcon, Visibility, VisibilityOff, CameraAlt as CameraIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { maskCPF, maskPhone } from '../../utils/masks';
import type { Employee } from '../../types/Employee';

interface EmployeeModalProps {
    open: boolean;
    onClose: () => void;
    employeeToEdit?: Employee | null;
}

export function EmployeeModal({ open, onClose, employeeToEdit }: EmployeeModalProps) {
    // Estados
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [location, setLocation] = useState('');
    const [pix, setPix] = useState('');
    const [social, setSocial] = useState('');
    const [password, setPassword] = useState('');
    const [salary, setSalary] = useState('');

    const [showSalary, setShowSalary] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Preenche os dados ao abrir (Editar ou Novo)
    useEffect(() => {
        if (open) {
            if (employeeToEdit) {
                // MODO EDIÇÃO: Preenche TUDO
                setName(employeeToEdit.name || '');
                setEmail(employeeToEdit.email || '');
                setRole(employeeToEdit.role || '');
                setCpf(maskCPF(employeeToEdit.cpf || ''));
                setPhone(maskPhone(employeeToEdit.phone || ''));
                setLocation(employeeToEdit.location || '');
                setBirthDate(employeeToEdit.birthDate || '');
                setPix(employeeToEdit.pixKey || '');
                setSocial(employeeToEdit.socialLinks || '');

                // Salário (converte para string)
                setSalary(employeeToEdit.salary ? employeeToEdit.salary.toString() : '');

                setPassword(''); // Senha vazia por segurança
            } else {
                // MODO CRIAÇÃO
                limparCampos();
            }
        }
    }, [open, employeeToEdit]);

    const limparCampos = () => {
        setName(''); setCpf(''); setEmail(''); setRole(''); setPhone('');
        setBirthDate(''); setLocation(''); setPix(''); setSocial('');
        setPassword(''); setSalary('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            name, email, cpf, role, phone, birthDate,
            location, pixKey: pix, socialLinks: social, password, salary
        };

        try {
            if (employeeToEdit) {
                await api.put(`/employees/${employeeToEdit.id}`, data);
                alert("Funcionário atualizado!");
            } else {
                await api.post('/employees', data);
                alert("Funcionário cadastrado!");
            }

            onClose();
            window.location.reload();

        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <Typography variant="h6" fontWeight="bold">
                    {employeeToEdit ? "Editar Funcionário" : "Novo Funcionário"}
                </Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 4 }}>
                    <Grid container spacing={3}>

                        {/* FOTO */}
                        <Grid item xs={12} display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                            <Box sx={{ position: 'relative' }}>
                                <Avatar sx={{ width: 100, height: 100, bgcolor: '#eee', color: '#999', fontSize: '3rem' }}>{name ? name[0] : '?'}</Avatar>
                                <IconButton sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#6C4FFF', color: 'white' }}><CameraIcon fontSize="small" /></IconButton>
                            </Box>
                        </Grid>

                        {/* DADOS PESSOAIS */}
                        <Grid item xs={12}><Typography variant="subtitle2" color="primary">Dados Pessoais</Typography></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Nome Completo" fullWidth required value={name} onChange={e => setName(e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Data de Aniversário" type="date" fullWidth InputLabelProps={{ shrink: true }} value={birthDate} onChange={e => setBirthDate(e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Telefone / WhatsApp" fullWidth required value={phone} onChange={e => setPhone(maskPhone(e.target.value))} inputProps={{ maxLength: 15 }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Localização / Cidade" fullWidth value={location} onChange={e => setLocation(e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="CPF" fullWidth required value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} inputProps={{ maxLength: 14 }} /></Grid>

                        {/* CORPORATIVO */}
                        <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle2" color="primary">Corporativo & Pagamento</Typography></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Cargo" fullWidth required value={role} onChange={e => setRole(e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6}><TextField label="E-mail Corporativo" type="email" fullWidth required value={email} onChange={e => setEmail(e.target.value)} /></Grid>

                        {/* 👇 AQUI ESTAVAM FALTANDO OS CAMPOS NA SUA VERSÃO ANTERIOR 👇 */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Salário (R$)"
                                fullWidth
                                type={showSalary ? "number" : "password"}
                                value={salary}
                                onChange={e => setSalary(e.target.value)}
                                InputProps={{
                                    endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowSalary(!showSalary)} edge="end">{showSalary ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>)
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}><TextField label="Chave Pix" fullWidth placeholder="CPF, Email ou Aleatória" value={pix} onChange={e => setPix(e.target.value)} /></Grid>

                        {/* ACESSO */}
                        <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle2" color="primary">Acesso & Social</Typography></Grid>
                        <Grid item xs={12} sm={6}><TextField label="Redes Sociais (Link)" fullWidth placeholder="Instagram / LinkedIn" value={social} onChange={e => setSocial(e.target.value)} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Senha de Acesso"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>)
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, bgcolor: '#fafafa' }}>
                    <Button onClick={onClose} sx={{ color: '#666' }}>Cancelar</Button>
                    <Button type="submit" variant="contained" size="large" sx={{ bgcolor: '#6C4FFF', px: 4 }}>
                        {employeeToEdit ? "Salvar Alterações" : "Salvar Cadastro"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}