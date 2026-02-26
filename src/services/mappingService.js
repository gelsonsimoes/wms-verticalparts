/**
 * mappingService.js
 * Gerenciador de persistência para templates de mapeamento de layouts (ETL).
 * Utiliza localStorage para simular uma base de dados persistente.
 */

const STORAGE_KEY = 'vp_wms_layout_templates';

const mappingService = {
    /**
     * Salva um novo template ou atualiza um existente
     * @param {Object} template { name, mappings, fileName, date, wmsFields }
     */
    saveTemplate: (template) => {
        const templates = mappingService.getTemplates();
        const newTemplate = {
            id: Date.now().toString(),
            date: new Date().toLocaleString('pt-BR'),
            ...template
        };
        
        const updatedTemplates = [newTemplate, ...templates];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
        return newTemplate;
    },

    /**
     * Retorna todos os templates salvos
     */
    getTemplates: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Erro ao ler templates do localStorage', e);
            return [];
        }
    },

    /**
     * Exclui um template pelo ID
     */
    deleteTemplate: (id) => {
        const templates = mappingService.getTemplates();
        const filtered = templates.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
};

export default mappingService;
