import { defineStore } from 'pinia'

export const useScansStore = defineStore('scans', {
    state: () => ({
        scans: [],
        currentScan: null,
        loading: false,
        error: null
    }),

    getters: {
        recentScans: (state) => state.scans.slice(0, 10),
        completedScans: (state) => state.scans.filter(s => s.status === 'completed'),
        runningScans: (state) => state.scans.filter(s => s.status === 'running')
    },

    actions: {
        async fetchScans() {
            this.loading = true
            this.error = null

            try {
                // Simulation de données
                await new Promise(resolve => setTimeout(resolve, 800))

                this.scans = [
                    {
                        id: 1,
                        name: 'Scan réseau complet',
                        type: 'network',
                        target: '192.168.1.0/24',
                        status: 'completed',
                        startDate: new Date(Date.now() - 86400000).toISOString(),
                        endDate: new Date(Date.now() - 82800000).toISOString(),
                        findings: 15,
                        vulnerabilities: 3
                    },
                    {
                        id: 2,
                        name: 'Scan applicatif Web',
                        type: 'application',
                        target: 'https://example.com',
                        status: 'running',
                        startDate: new Date(Date.now() - 3600000).toISOString(),
                        progress: 67
                    },
                    {
                        id: 3,
                        name: 'Scan ports critiques',
                        type: 'network',
                        target: '10.0.0.0/8',
                        status: 'completed',
                        startDate: new Date(Date.now() - 172800000).toISOString(),
                        endDate: new Date(Date.now() - 169200000).toISOString(),
                        findings: 42,
                        vulnerabilities: 8
                    }
                ]
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        async startScan(scanConfig) {
            this.loading = true

            try {
                await new Promise(resolve => setTimeout(resolve, 1000))

                const newScan = {
                    id: Date.now(),
                    ...scanConfig,
                    status: 'running',
                    startDate: new Date().toISOString(),
                    progress: 0
                }

                this.scans.unshift(newScan)
                return { success: true, scanId: newScan.id }
            } catch (error) {
                this.error = error.message
                return { success: false, error: error.message }
            } finally {
                this.loading = false
            }
        },

        async stopScan(scanId) {
            const scan = this.scans.find(s => s.id === scanId)
            if (scan) {
                scan.status = 'stopped'
                scan.endDate = new Date().toISOString()
            }
        }
    }
})