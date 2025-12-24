import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        general: {
            siteName: 'CyberShield PME',
            language: 'fr',
            timezone: 'Africa/Douala'
        },
        security: {
            sessionTimeout: 30,
            twoFactorAuth: false,
            passwordExpiry: 90
        },
        notifications: {
            email: true,
            sms: false,
            browser: true
        },
        scanning: {
            autoScan: false,
            scanFrequency: 'weekly',
            maxConcurrentScans: 3
        }
    }),

    actions: {
        async updateSettings(category, settings) {
            this[category] = { ...this[category], ...settings }
            // Simuler une sauvegarde
            await new Promise(resolve => setTimeout(resolve, 500))
        }
    }
})