import { useState } from "react";
import { Box, Typography, IconButton, Chip, Divider, Button, CircularProgress } from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    CalendarMonth as CalendarMonthIcon,
    LocationOn as LocationOnIcon,
    Add as AddIcon,
    ReceiptLong as ReceiptLongIcon,
    AccessTime as AccessTimeIcon,
} from "@mui/icons-material";

interface Props {
    title: string;
    description?: string;
    matricula?: string;

    rentValue?: string;

    clientName?: string;
    rentDueDate?: string;          // dia de vencimento (ex: Dia 05)

    contractStartDate?: string;    // início do contrato (dd/mm/yyyy)
    contractDueDate?: string;      // vencimento do contrato (dd/mm/yyyy)

    iptuStatus?: string;
    monthsLate?: number | string;  // meses em atraso

    address?: string;
    loading?: boolean;

    // ações
    onEdit?: () => void;
    onDelete?: () => void;

    // botão “Novo imóvel neste ponto” (carrossel)
    onAddAnother?: () => void;

    // botão de ação genérico (pino temporário: “Cadastrar aqui”)
    onAction?: () => void;
    actionLabel?: string;

    // se true, NÃO renderiza o Box externo (usado no carrossel)
    withoutContainer?: boolean;
}

export function PropertyCardPopup(props: Props) {
    const {
        title,
        description,
        matricula,
        rentValue,
        clientName,
        rentDueDate,
        contractStartDate,
        contractDueDate,
        iptuStatus,
        monthsLate,
        address,
        loading,
        onEdit,
        onDelete,
        onAddAnother,
        onAction,
        actionLabel,
        withoutContainer,
    } = props;

    // página interna: "info" (topo) | "status" (parte de baixo)
    const [section, setSection] = useState<"info" | "status">("info");

    // --------- MIÓLO DO CARD (sem container) ----------
    const contentTop = (
        <>
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" mb={0.8}>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, fontSize: "14px", lineHeight: 1.2 }}
                >
                    {title}
                </Typography>

                <Box>
                    {onEdit && (
                        <IconButton size="small" onClick={onEdit}>
                            <EditIcon fontSize="inherit" />
                        </IconButton>
                    )}
                    {onDelete && (
                        <IconButton size="small" onClick={onDelete}>
                            <DeleteIcon fontSize="inherit" />
                        </IconButton>
                    )}
                </Box>
            </Box>

            {/* DESCRIÇÃO (opcional) */}
            {description && (
                <Typography sx={{ fontSize: "11px", color: "#777", mb: 0.6 }}>
                    {description}
                </Typography>
            )}

            {/* Matrícula */}
            <Typography sx={{ fontSize: "11px", color: "#777", mb: 0.6 }}>
                Matrícula: {matricula ?? "---"}
            </Typography>

            {/* VALOR ALUGUEL — Box Roxo */}
            <Box
                sx={{
                    bgcolor: "#6C4FFF",
                    borderRadius: "10px",
                    p: 0.8,
                    color: "white",
                    mb: 1.1,
                }}
            >
                <Typography sx={{ fontSize: "10px", opacity: 0.85 }}>
                    Valor Aluguel
                </Typography>

                <Typography sx={{ fontSize: "15px", fontWeight: 700 }}>
                    {rentValue ?? "—"}
                </Typography>
            </Box>

            {/* LOADING PARA PINO TEMPORÁRIO (quando está buscando endereço) */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
                    <CircularProgress size={22} />
                </Box>
            )}

            {/* CLIENTE / DIA */}
            <Typography sx={{ color: "#999", fontSize: "11px", mb: 0.4 }}>
                Inquilino / Cliente
            </Typography>

            <Box display="flex" alignItems="center" gap={0.6} mb={1}>
                <PersonIcon sx={{ color: "#6C4FFF", fontSize: 16 }} />
                <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
                    {clientName ?? "—"}
                </Typography>

                <CalendarMonthIcon
                    sx={{ color: "#6C4FFF", ml: "auto", fontSize: 16 }}
                />
                <Typography sx={{ fontSize: "12px" }}>
                    Dia {rentDueDate ?? "--"}
                </Typography>
            </Box>
        </>
    );

    const contentStatus = (
        <>
            <Divider sx={{ my: 0.8 }} />

            {/* STATUS */}
            <Typography sx={{ color: "#999", fontSize: "11px", mb: 0.4 }}>
                Status
            </Typography>

            <Box display="flex" flexDirection="column" gap={0.6} mb={1.2}>
                {/* IPTU */}
                <Box display="flex" alignItems="center" gap={0.6}>
                    <ReceiptLongIcon sx={{ color: "#6C4FFF", fontSize: 16 }} />
                    <Typography sx={{ fontSize: "11px", color: "#555" }}>
                        IPTU:
                    </Typography>
                    <Chip
                        label={iptuStatus ?? "Sem info"}
                        size="small"
                        sx={{
                            bgcolor: iptuStatus === "Pendente" ? "#FEEAEA" : "#EAF7EA",
                            color: iptuStatus === "Pendente" ? "#D9534F" : "#3C9141",
                            fontWeight: 600,
                            height: 18,
                            fontSize: "10px",
                        }}
                    />
                </Box>

                {/* Meses em atraso */}
                <Box display="flex" alignItems="center" gap={0.6}>
                    <AccessTimeIcon sx={{ color: "#D9534F", fontSize: 16 }} />
                    <Typography sx={{ fontSize: "11px", color: "#555" }}>
                        Meses em atraso:
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: "12px" }}>
                        {monthsLate ?? 0}
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 0.8 }} />

            {/* CONTRATO: início e vencimento lado a lado */}
            <Typography sx={{ color: "#999", fontSize: "11px", mb: 0.4 }}>
                Contrato
            </Typography>

            <Box display="flex" justifyContent="space-between" mb={1.2}>
                <Box>
                    <Typography sx={{ color: "#999", fontSize: "10px" }}>
                        Início
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: "12px" }}>
                        {contractStartDate ?? "--/--/----"}
                    </Typography>
                </Box>

                <Box textAlign="right">
                    <Typography sx={{ color: "#999", fontSize: "10px" }}>
                        Venc.
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: "12px" }}>
                        {contractDueDate ?? "--/--/----"}
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 0.8 }} />

            {/* ENDEREÇO – só mostra se existir */}
            {address && (
                <Box display="flex" gap={0.6} mb={1}>
                    <LocationOnIcon
                        sx={{ color: "#6C4FFF", mt: "2px", fontSize: 16 }}
                    />
                    <Typography sx={{ fontSize: "11px", color: "#555" }}>
                        {address}
                    </Typography>
                </Box>
            )}
        </>
    );

    // botões da paginação interna
    const internalPager = (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                mt: 0.6,
                mb: onAddAnother || onAction ? 0.6 : 0,
            }}
        >
            <Button
                size="small"
                onClick={() => setSection("info")}
                sx={{
                    minWidth: 0,
                    px: 1.5,
                    borderRadius: "999px",
                    fontSize: "11px",
                    textTransform: "none",
                    bgcolor: section === "info" ? "#6C4FFF" : "transparent",
                    color: section === "info" ? "#fff" : "#777",
                    border: section === "info" ? "none" : "1px solid #ddd",
                    "&:hover": {
                        bgcolor: section === "info" ? "#5A3EEB" : "#f5f5f5",
                    },
                }}
            >
                Dados
            </Button>

            <Button
                size="small"
                onClick={() => setSection("status")}
                sx={{
                    minWidth: 0,
                    px: 1.5,
                    borderRadius: "999px",
                    fontSize: "11px",
                    textTransform: "none",
                    bgcolor: section === "status" ? "#6C4FFF" : "transparent",
                    color: section === "status" ? "#fff" : "#777",
                    border: section === "status" ? "none" : "1px solid #ddd",
                    "&:hover": {
                        bgcolor: section === "status" ? "#5A3EEB" : "#f5f5f5",
                    },
                }}
            >
                Status
            </Button>
        </Box>
    );

    const content = (
        <>
            {section === "info" ? contentTop : contentStatus}
            {internalPager}

            {/* BOTÃO PARA PINO TEMPORÁRIO (Cadastrar aqui) */}
            {onAction && (
                <Button
                    fullWidth
                    variant="contained"
                    sx={{
                        bgcolor: "#6C4FFF",
                        borderRadius: "10px",
                        textTransform: "none",
                        mt: 0.6,
                        fontWeight: 600,
                        fontSize: "12px",
                        "&:hover": { bgcolor: "#5A3EEB" },
                    }}
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            )}

            {/* BOTÃO PARA CRIAR OUTRO IMÓVEL NESTE PONTO (carrossel) */}
            {onAddAnother && (
                <Button
                    fullWidth
                    variant="contained"
                    sx={{
                        bgcolor: "#6C4FFF",
                        borderRadius: "999px",
                        textTransform: "none",
                        mt: 0.8,
                        fontWeight: 600,
                        fontSize: "12px",
                        py: 1,
                        "&:hover": { bgcolor: "#5A3EEB" },
                    }}
                    onClick={onAddAnother}
                    startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                >
                     Novo imóvel
                </Button>
            )}
        </>
    );

    // Se withoutContainer = true, quem manda no "card" é o carrossel
    if (withoutContainer) {
        return <>{content}</>;
    }

    // Caso padrão: card completo (usado no pino temporário, etc.)
    return (
        <Box
            sx={{
                width: 260,
                bgcolor: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                p: 1.1,
                pb: 1.4,
            }}
        >
            {content}
        </Box>
    );
}
