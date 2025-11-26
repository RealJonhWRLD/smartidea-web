export interface Property {
    id: string;
    name: string;
    description: string;
    clientName: string;
    lat: number;
    lng: number;
    matricula: string;
    rentValue: string;
    rentDueDate: string;

    // NOVOS CAMPOS (contrato + atraso)
    contractStartDate?: string;   // início do contrato dd/mm/yyyy
    contractDueDate: string;      // vencimento do contrato dd/mm/yyyy
    monthsLate?: number;          // meses em atraso (para o card de status)

    iptuStatus: string;
    rentPaymentStatus: string;
    propertyType: string;

    // Campos extras que o modal usa
    clientPhone?: string;
    condoValue?: string;
    depositValue?: string;
    cagece?: string;
    enel?: string;
    lastRenovation?: string;
    createdAt?: string;
    updatedAt?: string;

    tenantType?: 'PF' | 'PJ';

    tenantCpf?: string;
    tenantRg?: string;
    tenantEmail?: string;
    tenantPhone2?: string;
    tenantSocial?: string;
    tenantBirthDate?: string;
    tenantMaritalStatus?: string;
    tenantProfession?: string;

    companyName?: string;
    companyCnpj?: string;
    legalRepName?: string;
    legalRepCpf?: string;

    // opcional: endereço formatado pra mostrar no card
    address?: string;
}