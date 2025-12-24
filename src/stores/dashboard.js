import { defineStore } from 'pinia'

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        stats: {
            totalScans: 142,
            activeAlerts: 23,
            vulnerabilities: 87,
            systemHealth: 92
        },
        recentActivity: [],
        loading: false
    }),

    getters: {
        criticalVulnerabilities: (state) => {
            return state.stats.vulnerabilities ? Math.floor(state.stats.vulnerabilities * 0.15) : 0
        },

        systemStatus: (state) => {
            const health = state.stats.systemHealth
            if (health >= 90) return 'excellent'
            if (health >= 70) return 'good'
            if (health >= 50) return 'warning'
            return 'critical'
        }
    },

    actions: {
        async fetchDashboardData() {
            this.loading = true

            try {
                // Simulation de données
                await new Promise(resolve => setTimeout(resolve, 500))

                this.stats = {
                    totalScans: 142,
                    activeAlerts: 23,
                    vulnerabilities: 87,
                    systemHealth: 92
                }

                this.recentActivity = [
                    {
                        id: 1,
                        type: 'scan',
                        message: 'Scan réseau terminé',
                        timestamp: new Date().toISOString(),
                        severity: 'info'
                    },
                    {
                        id: 2,
                        type: 'alert',
                        message: 'Vulnérabilité critique détectée',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        severity: 'critical'
                    },
                    {
                        id: 3,
                        type: 'system',
                        message: 'Mise à jour des signatures IDS',
                        timestamp: new Date(Date.now() - 7200000).toISOString(),
                        severity: 'success'
                    }
                ]
            } finally {
                this.loading = false
            }
        }
    }
})