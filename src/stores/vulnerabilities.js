import { defineStore } from 'pinia'

export const useVulnerabilitiesStore = defineStore('vulnerabilities', {
    state: () => ({
        vulnerabilities: [],
        selectedVuln: null,
        loading: false,
        filters: {
            severity: null,
            status: null
        }
    }),

    getters: {
        filteredVulnerabilities: (state) => {
            let result = state.vulnerabilities

            if (state.filters.severity) {
                result = result.filter(v => v.severity === state.filters.severity)
            }

            if (state.filters.status) {
                result = result.filter(v => v.status === state.filters.status)
            }

            return result
        },

        criticalCount: (state) => state.vulnerabilities.filter(v => v.severity === 'critical').length,
        highCount: (state) => state.vulnerabilities.filter(v => v.severity === 'high').length,
        mediumCount: (state) => state.vulnerabilities.filter(v => v.severity === 'medium').length,
        lowCount: (state) => state.vulnerabilities.filter(v => v.severity === 'low').length
    },

    actions: {
        async fetchVulnerabilities() {
            this.loading = true

            try {
                await new Promise(resolve => setTimeout(resolve, 600))

                this.vulnerabilities = [
                    {
                        id: 1,
                        cve: 'CVE-2024-1234',
                        title: 'Buffer Overflow dans OpenSSL',
                        description: 'Une vulnérabilité de débordement de tampon a été découverte dans OpenSSL version 3.0.x',
                        severity: 'critical',
                        cvss: 9.8,
                        status: 'open',
                        affectedSystems: ['Server-01', 'Server-03'],
                        discoveredDate: new Date(Date.now() - 86400000).toISOString(),
                        recommendation: 'Mettre à jour OpenSSL vers la version 3.0.13 ou supérieure'
                    },
                    {
                        id: 2,
                        cve: 'CVE-2024-5678',
                        title: 'Injection SQL dans application Web',
                        description: 'Vulnérabilité d\'injection SQL permettant l\'exécution de requêtes arbitraires',
                        severity: 'high',
                        cvss: 8.1,
                        status: 'in_progress',
                        affectedSystems: ['Web-App-01'],
                        discoveredDate: new Date(Date.now() - 172800000).toISOString(),
                        recommendation: 'Implémenter des requêtes préparées et valider toutes les entrées utilisateur'
                    },
                    {
                        id: 3,
                        cve: 'CVE-2024-9012',
                        title: 'Cross-Site Scripting (XSS)',
                        description: 'Faille XSS reflétée dans le formulaire de recherche',
                        severity: 'medium',
                        cvss: 6.1,
                        status: 'open',
                        affectedSystems: ['Web-Portal'],
                        discoveredDate: new Date(Date.now() - 259200000).toISOString(),
                        recommendation: 'Échapper toutes les sorties HTML et implémenter Content Security Policy'
                    },
                    {
                        id: 4,
                        cve: 'CVE-2024-3456',
                        title: 'Permissions de fichiers incorrectes',
                        description: 'Fichiers de configuration avec permissions trop permissives',
                        severity: 'low',
                        cvss: 3.7,
                        status: 'resolved',
                        affectedSystems: ['Server-02'],
                        discoveredDate: new Date(Date.now() - 345600000).toISOString(),
                        resolvedDate: new Date(Date.now() - 86400000).toISOString(),
                        recommendation: 'Appliquer chmod 600 sur les fichiers de configuration sensibles'
                    }
                ]
            } finally {
                this.loading = false
            }
        },

        setFilter(filterType, value) {
            this.filters[filterType] = value
        },

        clearFilters() {
            this.filters = {
                severity: null,
                status: null
            }
        },

        selectVulnerability(id) {
            this.selectedVuln = this.vulnerabilities.find(v => v.id === id)
        }
    }
})