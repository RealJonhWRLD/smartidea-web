import { useState } from 'react';
import { Box, IconButton, Typography, Stack } from '@mui/material';
import {
    ArrowBackIosNew as ArrowBackIosNewIcon,
    ArrowForwardIos as ArrowForwardIosIcon,
} from '@mui/icons-material';

import type { Property } from '../../types/Property';
import { PropertyCardPopup } from './PropertyCardPopup';

interface PropertyCarouselPopupProps {
    properties: Property[];
    onEdit?: (property: Property) => void;
    onDelete?: (property: Property) => void;
    onAddAnother?: (property: Property) => void;
}

export function PropertyCarouselPopup({
                                          properties,
                                          onEdit,
                                          onDelete,
                                          onAddAnother,
                                      }: PropertyCarouselPopupProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const current = properties[currentIndex];
    const hasMultiple = properties.length > 1;

    const goPrev = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? properties.length - 1 : prev - 1,
        );
    };

    const goNext = () => {
        setCurrentIndex((prev) =>
            prev === properties.length - 1 ? 0 : prev + 1,
        );
    };

    return (
        <Box
            sx={{
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                p: 0,
            }}
        >
            {/* HEADER DO CARROSSEL (dentro do mesmo card do Leaflet) */}
            {hasMultiple && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 0.8 }}
                >
                    <IconButton size="small" onClick={goPrev}>
                        <ArrowBackIosNewIcon fontSize="inherit" />
                    </IconButton>

                    <Typography variant="caption">
                        Imóvel {currentIndex + 1} de {properties.length}
                    </Typography>

                    <IconButton size="small" onClick={goNext}>
                        <ArrowForwardIosIcon fontSize="inherit" />
                    </IconButton>
                </Stack>
            )}

            {/* CORPO DO CARD – sem container próprio, usa o card do Leaflet */}
            <PropertyCardPopup
                withoutContainer
                title={current.name}
                description={current.description}
                clientName={current.clientName}
                matricula={current.matricula}
                rentValue={current.rentValue}
                rentDueDate={current.rentDueDate}
                contractStartDate={current.contractStartDate}
                contractDueDate={current.contractDueDate}
                iptuStatus={current.iptuStatus}
                monthsLate={current.monthsLate}
                address={current.address}
                onEdit={onEdit ? () => onEdit(current) : undefined}
                onDelete={onDelete ? () => onDelete(current) : undefined}
                onAddAnother={
                    onAddAnother ? () => onAddAnother(current) : undefined
                }
            />
        </Box>
    );
}