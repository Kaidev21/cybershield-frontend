import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/scans',
        name: 'Scans',
        component: () => import('../views/ScansView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/vulnerabilities',
        name: 'Vulnerabilities',
        component: () => import('../views/VulnerabilitiesView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/alerts',
        name: 'Alerts',
        component: () => import('../views/AlertsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/reports',
        name: 'Reports',
        component: () => import('../views/ReportsView.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/SettingsView.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
    } else if (to.path === '/login' && authStore.isAuthenticated) {
        next('/')
    } else {
        next()
    }
})

export default router