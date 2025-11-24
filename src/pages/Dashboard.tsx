import { Grid, Paper, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Checkbox } from '@mui/material';
import ReactECharts from 'echarts-for-react'; // Biblioteca de gráficos

export function Dashboard() {

    // Configuração do Gráfico de Pizza (Despesas)
    const pieOption = {
        tooltip: { trigger: 'item' },
        legend: { top: '5%', left: 'center' },
        series: [
            {
                name: 'Despesas',
                type: 'pie',
                radius: ['40%', '70%'], // Faz o buraco no meio (Donut)
                avoidLabelOverlap: false,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: false },
                data: [
                    { value: 1048, name: 'TI', itemStyle: { color: '#6C4FFF' } },
                    { value: 735, name: 'Operacional', itemStyle: { color: '#624DE3' } },
                    { value: 580, name: 'RH', itemStyle: { color: '#4F8BFF' } },
                    { value: 484, name: 'Marketing', itemStyle: { color: '#A090FF' } },
                ]
            }
        ]
    };

    // Configuração do Gráfico de Linha (Fluxo)
    const lineOption = {
        grid: { top: 20, right: 20, bottom: 20, left: 40, containLabel: true },
        xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun'], axisLine: { show: false }, axisTick: { show: false } },
        yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
        series: [{
            data: [12000, 18000, 15000, 22000, 26000, 25400],
            type: 'line',
            smooth: true,
            symbolSize: 8,
            lineStyle: { color: '#4F8BFF', width: 4 },
            itemStyle: { color: '#4F8BFF' }
        }]
    };

    return (
        <Box>
            {/* Título e Ilustração (Placeholder) */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h3" sx={{ color: '#1A1A1A' }}>ERP</Typography>
                    <Typography variant="body1" color="textSecondary">Visão geral do sistema</Typography>
                </Box>
            </Box>

            {/* KPIs (Indicadores) */}
            <Grid container spacing={3} mb={4}>
                {/* Card Roxo - Faturamento */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: '#6C4FFF', color: 'white', borderRadius: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Faturamento do mês</Typography>
                        <Typography variant="h3" fontWeight="bold">R$ 25.400</Typography>
                    </Paper>
                </Grid>

                {/* Card Clientes */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: '20px', height: '100%' }}>
                        <Typography variant="body2" color="textSecondary">Clientes ativos</Typography>
                        <Typography variant="h3" fontWeight="bold">124</Typography>
                    </Paper>
                </Grid>

                {/* Card Funcionários */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: '20px', height: '100%' }}>
                        <Typography variant="body2" color="textSecondary">Funcionários</Typography>
                        <Typography variant="h3" fontWeight="bold">8</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Gráficos */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: '20px', height: '350px' }}>
                        <Typography variant="h6" gutterBottom>Despesas por categoria</Typography>
                        <ReactECharts option={pieOption} style={{ height: '90%' }} />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: '20px', height: '350px' }}>
                        <Typography variant="h6" gutterBottom>Fluxo financeiro mensal</Typography>
                        <ReactECharts option={lineOption} style={{ height: '90%' }} />
                    </Paper>
                </Grid>
            </Grid>

            {/* Listas Inferiores */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '20px' }}>
                        <Typography variant="h6" gutterBottom>Próximas tarefas</Typography>
                        <List>
                            {['Enviar proposta p/ cliente', 'Reunião equipe', 'Revisar contrato'].map((text) => (
                                <ListItem key={text} disablePadding>
                                    <ListItemIcon><Checkbox defaultChecked sx={{ color: '#6C4FFF', '&.Mui-checked': { color: '#6C4FFF' } }} /></ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItem>
                            ))}
                            {['Atualizar cadastro', 'Verificar pagamento'].map((text) => (
                                <ListItem key={text} disablePadding>
                                    <ListItemIcon><Checkbox sx={{ color: '#6C4FFF' }} /></ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '20px' }}>
                        <Typography variant="h6" gutterBottom>Agenda de Hoje</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#aaa', width: '50px' }}>09:00</Typography>
                            <Typography variant="body1">Reunião com equipe</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#aaa', width: '50px' }}>11:00</Typography>
                            <Typography variant="body1">Call com cliente</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#aaa', width: '50px' }}>15:30</Typography>
                            <Typography variant="body1">Treinamento</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}