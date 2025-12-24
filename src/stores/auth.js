import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
        isAuthenticated: false,
        loading: false,
        error: null
    }),

    getters: {
        currentUser: (state) => state.user,
        isAdmin: (state) => state.user?.role === 'admin'
    },

    actions: {
        async login(credentials) {
            this.loading = true
            this.error = null

            try {
                // Simulation d'une connexion (à remplacer par votre API)
                if (credentials.email === 'admin@cybershield.com' && credentials.password === 'admin123') {
                    const token = 'fake-jwt-token-' + Date.now()
                    const user = {
                        id: 1,
                        name: 'Yann Landry',
                        email: credentials.email,
                        role: 'admin',
                        company: 'CyberShield PME'
                    }

                    this.token = token
                    this.user = user
                    this.isAuthenticated = true
                    localStorage.setItem('token', token)

                    return { success: true }
                } else {
                    throw new Error('Identifiants incorrects')
                }
            } catch (error) {
                this.error = error.message
                return { success: false, error: error.message }
            } finally {
                this.loading = false
            }
        },

        async logout() {
            this.user = null
            this.token = null
            this.isAuthenticated = false
            localStorage.removeItem('token')
        },

        checkAuth() {
            const token = localStorage.getItem('token')
            if (token) {
                this.token = token
                this.isAuthenticated = true
                this.user = {
                    id: 1,
                    name: 'Yann Landry',
                    email: 'admin@cybershield.com',
                    role: 'admin',
                    company: 'CyberShield PME'
                }
            }
        }
    }
})