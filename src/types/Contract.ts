export type ContractStatus = 'ACTIVE' | 'TERMINATED' | string;

export interface ContractHistoryItemDTO {
    id: string;
    tenantName: string;
    startDate: string | null;
    endDate: string | null;
    rentValue: string;
    status: ContractStatus;
}

export interface ContractDTO {
    id: string;
    propertyId: string;
    propertyName: string;
    tenantId: string;
    tenantName: string;
    startDate: string | null;
    endDate: string | null;
    rentValue: string;
    status: ContractStatus;
}

/**
 * Payload usado no POST /contracts
 * espelha o ContractRequestDTO do backend
 */
export interface ContractCreateRequest {
    propertyId: string;
    tenantId: string;

    rentValue: string;
    paymentDay: string;
    startDate: string;
    endDate?: string | null;

    // CAMPOS OPCIONAIS (correto)
    condoValue?: string | null;
    depositValue?: string | null;
    iptuStatus?: string | null;
    monthsInContract?: number | null;
    notes?: string | null;
}
