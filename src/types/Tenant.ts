export interface Tenant {
    id: string;
    name: string;
    tenantType: string; // "PF" | "PJ" se quiser tipar melhor depois
    tenantCpf?: string;
    tenantRg?: string;
    tenantEmail?: string;
    tenantPhone?: string;
    tenantPhone2?: string;
    tenantAddress?: string;
}
