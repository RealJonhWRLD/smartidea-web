// src/types/Contract.ts

export type ContractStatus = 'ATIVO' | 'ENCERRADO' | 'RESCINDIDO' | string;

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

export interface ContractCreateRequest {
    propertyId: string;
    tenantId: string;
    rentValue: string;
    condoValue: string;
    depositValue: string;
    paymentDay: string;
    iptuStatus: string;
    startDate: string;
    endDate: string | null;
    monthsInContract: number | null;
    notes: string;
}
