import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, Avatar, Stack, Button } from '@mui/material';
import { Home, People, Inventory, Calculate, CalendarMonth, Task, Logout } from '@mui/icons-material';

const sidebarWidth = 80;

export function DefaultLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const sidebarItems = [
        { icon: <Home />, path: '/dashboard' },
        { icon: <People />, path: '/employees' },
        { icon: <Inventory />, path: '/inventory' },
        { icon: <Calculate />, path: '/finance' },
        { icon: <CalendarMonth />, path: '/schedule' },
        { icon: <Task />, path: '/tasks' },
    ];

    const topMenu = ['Mapas', 'Imóveis', 'Relatórios', 'Inquilinos', 'Lembretes', 'Melhorias'];

    return (
        <Box sx={{ display: 'flex' }}>

            {/* 1. Header (Topo) */}
            <AppBar position="fixed" sx={{ width: `calc(100% - ${sidebarWidth}px)`, ml: `${sidebarWidth}px`, bgcolor: 'white', color: 'text.primary', boxShadow: 'none', borderBottom: '1px solid #eee' }}>
                <Toolbar>
                    <Typography variant="h5" sx={{ color: '#6C4FFF', fontWeight: 'bold', mr: 4 }}>
                        Smart Idea
                    </Typography>

                    {/* MENU SUPERIOR */}
                    <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
                        {topMenu.map((item) => (
                            <Button
                                key={item}
                                color="inherit"
                                sx={{ fontWeight: 500, color: '#666' }}
                                onClick={() => {
                                    // 👇 AQUI ESTÁ A LÓGICA DE NAVEGAÇÃO
                                    if(item === 'Mapas') navigate('/maps');
                                    if(item === 'Imóveis') navigate('/properties'); // <--- ADICIONADO!
                                    if(item === 'Funcionários') navigate('/employees');

                                    // Futuramente:
                                    // if(item === 'Financeiro') navigate('/finance');
                                }}
                            >
                                {item}
                            </Button>
                        ))}
                    </Stack>

                    <Avatar sx={{ bgcolor: '#6C4FFF' }}>A</Avatar>
                </Toolbar>
            </AppBar>

            {/* 2. Sidebar (Esquerda) */}
            <Drawer
                variant="permanent"
                sx={{
                    width: sidebarWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: sidebarWidth, boxSizing: 'border-box', borderRight: 'none', bgcolor: '#F6F7FB' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <List>
                        {sidebarItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <ListItem key={item.path} disablePadding sx={{ mb: 2 }}>
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            justifyContent: 'center',
                                            borderRadius: '12px',
                                            bgcolor: isActive ? '#fff' : 'transparent',
                                            boxShadow: isActive ? '0px 4px 10px rgba(0,0,0,0.05)' : 'none',
                                            color: isActive ? '#6C4FFF' : '#aaa',
                                            '&:hover': { bgcolor: '#fff', color: '#6C4FFF' }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>{item.icon}</ListItemIcon>
                                    </ListItemButton>
                                </ListItem>
                            )})}

                        <ListItem disablePadding sx={{ mt: 4 }}>
                            <ListItemButton onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>
                                <ListItemIcon sx={{ minWidth: 0, color: '#E54545' }}><Logout /></ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* 3. Conteúdo */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: location.pathname === '/maps' ? 0 : 3,
                    width: `calc(100% - ${sidebarWidth}px)`,
                    mt: 8,
                    height: location.pathname === '/maps' ? 'calc(100vh - 64px)' : 'auto',
                    overflow: location.pathname === '/maps' ? 'hidden' : 'auto'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}