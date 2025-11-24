export const maskPhone = (value: string) => {
    if (!value) return "";

    // Remove tudo que não é dígito
    value = value.replace(/\D/g, '');

    // (XX) 9XXXX-XXXX
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");

    return value;
};

export const maskCPF = (value: string) => {
    if (!value) return "";

    value = value.replace(/\D/g, ''); // Remove letras

    // 000.000.000-00
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    return value;
};

// Remove a formatação para enviar pro banco limpo (opcional, mas recomendado)
export const unmask = (value: string) => {
    return value.replace(/\D/g, '');
};