import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Avatar, IconButton, CircularProgress } from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon, Phone as PhoneIcon, Email as EmailIcon, Edit as EditIcon } from '@mui/icons-material';
import { EmployeeModal } from '../components/registeredOfficials/EmployeeModal';
import api from '../services/api';
import type { Employee } from '../types/Employee';

export function Employees() {
    const [openModal, setOpenModal] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee); // Guarda os dados para edição
        setOpenModal(true); // Abre o modal
    };

    // Função que busca no Java
    async function loadEmployees() {
        try {
            setLoading(true);
            const response = await api.get('/employees');
            setEmployees(response.data);
        } catch (error) {
            console.error("Erro ao buscar funcionários", error);
            alert("Erro de conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    }

    // Roda 1 vez quando a tela abre
    useEffect(() => {
        loadEmployees();
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1A1A1A' }}>
                    Funcionários
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenModal(true)}
                    sx={{ bgcolor: '#6C4FFF', padding: '10px 24px', fontSize: '1rem', '&:hover': { bgcolor: '#5639cc' } }}
                >
                    Cadastrar funcionário
                </Button>
            </Box>

            {/* Loading ou Lista */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress sx={{ color: '#6C4FFF' }} />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {employees.length === 0 && <Typography>Nenhum funcionário cadastrado.</Typography>}

                    {employees.map((employee) => (
                        <Paper key={employee.id} elevation={0} sx={{ p: 3, borderRadius: '16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', boxShadow: '0px 2px 10px rgba(0,0,0,0.02)' }}>
                            {/* Avatar e Nome */}
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 2, minWidth: '250px' }}>
                                <Avatar
                                    sx={{ width: 64, height: 64, mr: 3, bgcolor: '#6C4FFF', fontSize: '1.5rem' }}
                                    src={employee.photoUrl || `https://ui-avatars.com/api/?name=${employee.name}&background=random`}
                                />
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{employee.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{employee.role}</Typography>
                                </Box>
                            </Box>

                            {/* Contatos */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 2, minWidth: '250px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PhoneIcon sx={{ color: '#666', fontSize: 20 }} />
                                    <Typography variant="body1">{employee.phone}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmailIcon sx={{ color: '#666', fontSize: 20 }} />
                                    <Typography variant="body1">{employee.email}</Typography>
                                </Box>
                            </Box>

                            {/* Ações */}
                            <Box sx={{ flex: 0 }}>
                                <IconButton onClick={() => handleEdit(employee)} color="primary">
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            )}

            <EmployeeModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setEditingEmployee(null); // Limpa a edição ao fechar
                    loadEmployees();
                }}
                employeeToEdit={editingEmployee} // Passa o funcionário selecionado
            />
        </Box>
    );
}