/**
 * Mock Service para simular integração nativa com Omie ERP.
 * Simula endpoints de baixa de estoque e atualização financeira.
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const OmieApi = {
    // Simula a baixa de estoque no ERP após confirmação de coleta/embarque
    async syncStockMovement(orderId, items) {
        console.log(`[Omie] Iniciando sincronização de estoque para Pedido #${orderId}`);
        await delay(1500);

        // Simula sucesso na integração
        return {
            status: 'success',
            syncId: Math.random().toString(36).substr(2, 9).toUpperCase(),
            timestamp: new Date().toISOString(),
            affectedProducts: items.length,
            message: 'Estoque atualizado no Omie com sucesso.'
        };
    },

    // Simula o fechamento financeiro do pedido (faturamento)
    async finalizeOrderFinance(orderId) {
        console.log(`[Omie] Processando faturamento para Pedido #${orderId}`);
        await delay(2000);

        return {
            status: 'success',
            invoiceNumber: `NF-${Math.floor(100000 + Math.random() * 900000)}`,
            totalValue: 'R$ 12.450,00',
            omieStatus: 'Faturado'
        };
    },

    // Busca dados de produtos em tempo real do ERP
    async fetchProductData(sku) {
        await delay(800);
        return {
            sku,
            description: 'Pastilha de Freio Cerâmica VP',
            availableInOmie: 1540,
            price: 245.90
        };
    },

    // Simula a gravação do recebimento (Check-in) no ERP
    async recordReceiptInOmie(receiptData) {
        console.log(`[Omie] Gravando Recebimento da NF #${receiptData.nf}`);
        await delay(1500);

        return {
            status: 'success',
            omieTransactionId: Math.floor(Math.random() * 1000000),
            recordedAt: new Date().toISOString(),
            message: 'Recebimento registrado e estoque atualizado no ERP Omie.'
        };
    }
};
