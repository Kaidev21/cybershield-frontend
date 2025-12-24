import { defineStore } from 'pinia'

export const useAlertsStore = defineStore('alerts', {
    state: () => ({
        alerts: [],
        settings: {
            emailEnabled: true,
            smsEnabled: false,
            emailAddress: 'admin@cybershield.com',
            phoneNumber: '+237 XXX XXX XXX'
        },
        loading: false
    }),

    getters: {
        activeAlerts: (state) => state.alerts.filter(a => !a.acknowledged),
        criticalAlerts: (state) => state.alerts.filter(a => a.severity === 'critical' && !a.acknowledged)
    },

    actions: {
        async fetchAlerts() {
            this.loading = true

            try {
                await new Promise(resolve => setTimeout(resolve, 500))

                this.alerts = [
                    {
                        id: 1,
                        type: 'intrusion',
                        severity: 'critical',
                        title: 'Tentative d\'intrusion détectée',
                        description: 'Plusieurs tentatives de connexion SSH échouées depuis 185.220.101.X',
                        timestamp: new Date(Date.now() - 1800000).toISOString(),
                        acknowledged: false,
                        source: 'Suricata IDS'
                    },
                    {
                        id: 2,
                        type: 'vulnerability',
                        severity: 'high',
                        title: 'Nouvelle vulnérabilité critique',
                        description: 'CVE-2024-1234 affecte 3 de vos systèmes',
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        acknowledged: false,
                        source: 'Scanner Nuclei'
                    },
                    {
                        id: 3,
                        type: 'anomaly',
                        severity: 'medium',
                        title: 'Trafic réseau anormal',
                        description: 'Augmentation de 300% du trafic sortant sur le port 443',
                        timestamp: new Date(Date.now() - 7200000).toISOString(),
                        acknowledged: true,
                        source: 'Suricata IDS'
                    }
                ]
            } finally {
                this.loading = false
            }
        },

        async acknowledgeAlert(alertId) {
            const alert = this.alerts.find(a => a.id === alertId)
            if (alert) {
                alert.acknowledged = true
                alert.acknowledgedAt = new Date().toISOString()
            }
        },

        async updateSettings(newSettings) {
            this.settings = { ...this.settings, ...newSettings }
        }
    }
})