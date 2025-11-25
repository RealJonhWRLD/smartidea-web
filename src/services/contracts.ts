import api from './api';

export interface Contract {
    id: string;
    propertyId: string; // vamos mapear manualmente do backend
    tenantName: string;
    tenantPhone: string;
    rentValue: string;
    depositValue: string;
    condoValue: string;
    paymentDay: string;
    startDate: string;      // dd/MM/yyyy
    endDate?: string | null;
    monthsInContract?: number | null;
    monthsLate?: number | null;
    status: 'ACTIVE' | 'TERMINATED';
    terminationReason?: string | null;
    createdAt: string;
}

export interface CreateContractPayload {
    propertyId: string;
    tenantName: string;
    tenantPhone: string;
    rentValue: string;
    depositValue: string;
    condoValue: string;
    paymentDay: string;
    startDate: string; // dd/MM/yyyy
    endDate?: string;
    monthsLate?: number;
}

export interface TerminatePayload {
    terminationDate?: string;
    terminationReason?: string;
}

export const ContractsService = {
    listByProperty(propertyId: string) {
        return api.get<Contract[]>(`/contracts/property/${propertyId}`);
    },

    create(payload: CreateContractPayload) {
        return api.post<Contract>('/contracts', payload);
    },

    terminate(id: string, payload: TerminatePayload) {
        return api.put<Contract>(`/contracts/${id}/terminate`, payload);
    },
};
