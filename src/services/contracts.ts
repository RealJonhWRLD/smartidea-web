import api from './api';
import type {
    ContractDTO,
    ContractHistoryItemDTO,
    ContractCreateRequest,
} from '../types/Contract';

export interface TerminateContractPayload {
    reason?: string;
    endDate?: string; // "dd/MM/yyyy" (se seu backend aceitar assim)
}

export const ContractsService = {
    /**
     * Histórico de contratos de um imóvel
     * GET /properties/{id}/contracts
     */
    async listHistoryByProperty(propertyId: string) {
        const { data } = await api.get<ContractHistoryItemDTO[]>(
            `/properties/${propertyId}/contracts`,
        );
        return data;
    },

    /**
     * Criação de contrato
     * POST /contracts
     */
    async create(payload: ContractCreateRequest) {
        const { data } = await api.post<ContractDTO>('/contracts', payload);
        return data;
    },

    /**
     * Encerrar / rescindir contrato
     * POST /contracts/{id}/terminate?reason=...&endDate=...
     */
    async terminate(id: string, payload: TerminateContractPayload) {
        const params: Record<string, string> = {};

        if (payload.reason) params.reason = payload.reason;
        if (payload.endDate) params.endDate = payload.endDate;

        const { data } = await api.post<ContractDTO>(
            `/contracts/${id}/terminate`,
            null,
            { params },
        );

        return data;
    },
};
