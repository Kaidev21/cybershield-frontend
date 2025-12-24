<template>
  <nav class="navbar">
    <div class="navbar-left">
      <button @click="toggleSidebar" class="btn-menu">
        <Menu :size="24" />
      </button>
      <div class="search-box">
        <Search :size="18" />
        <input type="text" placeholder="Rechercher..." />
      </div>
    </div>

    <div class="navbar-right">
      <div class="notifications-wrapper">
        <button
            @click="toggleNotifications"
            class="icon-btn"
            :class="{ active: showNotifications }"
            title="Notifications"
        >
          <Bell :size="20" />
          <span v-if="alertsStore.activeAlerts.length > 0" class="badge">
            {{ alertsStore.activeAlerts.length }}
          </span>
        </button>

        <!-- Notifications Panel -->
        <transition name="slide-fade">
          <div v-if="showNotifications" class="notifications-panel">
            <div class="notifications-header">
              <h3>Notifications</h3>
              <div class="header-actions">
                <button
                    v-if="alertsStore.activeAlerts.length > 0"
                    @click="markAllAsRead"
                    class="btn-text"
                >
                  Tout marquer comme lu
                </button>
                <button @click="goToAlerts" class="btn-text primary">
                  Voir tout
                </button>
              </div>
            </div>

            <div class="notifications-body">
              <!-- Empty State -->
              <div v-if="recentAlerts.length === 0" class="empty-notifications">
                <BellOff :size="48" />
                <p>Aucune notification</p>
                <span>Vous êtes à jour !</span>
              </div>

              <!-- Notifications List -->
              <div v-else class="notifications-list">
                <div
                    v-for="alert in recentAlerts"
                    :key="alert.id"
                    class="notification-item"
                    :class="{ unread: !alert.acknowledged }"
                    @click="handleNotificationClick(alert)"
                >
                  <div class="notification-icon" :class="`severity-${alert.severity}`">
                    <component :is="getSeverityIcon(alert.severity)" :size="18" />
                  </div>
                  <div class="notification-content">
                    <div class="notification-title">{{ alert.title }}</div>
                    <div class="notification-description">{{ truncate(alert.description, 60) }}</div>
                    <div class="notification-meta">
                      <span class="notification-time">
                        <Clock :size="12" />
                        {{ getRelativeTime(alert.timestamp) }}
                      </span>
                      <span class="notification-source">
                        <Server :size="12" />
                        {{ alert.source }}
                      </span>
                    </div>
                  </div>
                  <div v-if="!alert.acknowledged" class="unread-dot"></div>
                </div>
              </div>
            </div>

            <div class="notifications-footer">
              <button @click="goToAlerts" class="btn-footer">
                <ExternalLink :size="16" />
                Voir toutes les alertes
              </button>
            </div>
          </div>
        </transition>
      </div>

      <div class="divider"></div>

      <div class="company-info">
        <Building :size="18" />
        <span>{{ authStore.user?.company }}</span>
      </div>
    </div>

    <!-- Alert Details Modal -->
    <AlertDetails
        v-if="selectedAlert"
        :alert="selectedAlert"
        @close="selectedAlert = null"
        @acknowledge="handleAcknowledge"
    />
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useAlertsStore } from '../../stores/alerts'
import {
  Menu,
  Search,
  Bell,
  BellOff,
  Building,
  Clock,
  Server,
  ExternalLink,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info
} from 'lucide-vue-next'
import AlertDetails from '../alerts/AlertDetails.vue'

const router = useRouter()
const authStore = useAuthStore()
const alertsStore = useAlertsStore()

const showNotifications = ref(false)
const selectedAlert = ref(null)

// Get recent alerts (max 5)
const recentAlerts = computed(() => {
  return alertsStore.alerts
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
})

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const closeNotifications = () => {
  showNotifications.value = false
}

const toggleSidebar = () => {
  // Pour mobile - à implémenter
  console.log('Toggle sidebar')
}

const handleNotificationClick = (alert) => {
  selectedAlert.value = alert
  closeNotifications()
}

const handleAcknowledge = async (alertId) => {
  await alertsStore.acknowledgeAlert(alertId)
  selectedAlert.value = null
}

const markAllAsRead = async () => {
  for (const alert of alertsStore.activeAlerts) {
    await alertsStore.acknowledgeAlert(alert.id)
  }
  closeNotifications()
}

const goToAlerts = () => {
  router.push('/alerts')
  closeNotifications()
}

const getSeverityIcon = (severity) => {
  const icons = {
    critical: AlertOctagon,
    high: AlertTriangle,
    medium: AlertCircle,
    low: Info
  }
  return icons[severity] || AlertCircle
}

const truncate = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const getRelativeTime = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'À l\'instant'
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// Close notifications when clicking outside
const handleClickOutside = (event) => {
  const notificationsWrapper = document.querySelector('.notifications-wrapper')
  if (notificationsWrapper && !notificationsWrapper.contains(event.target)) {
    closeNotifications()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Fetch alerts if not already loaded
  if (alertsStore.alerts.length === 0) {
    alertsStore.fetchAlerts()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar {
  height: 70px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-menu {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #f8fafc;
  border-radius: 10px;
  width: 350px;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1e293b;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notifications-wrapper {
  position: relative;
}

.icon-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #f8fafc;
  color: #1e293b;
}

.icon-btn.active {
  background: #e0e7ff;
  color: #4338ca;
}

.icon-btn .badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.notifications-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 420px;
  max-height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
}

.notifications-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.notifications-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-text {
  background: none;
  border: none;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-text:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-text.primary {
  color: #667eea;
}

.btn-text.primary:hover {
  background: #e0e7ff;
}

.notifications-body {
  flex: 1;
  overflow-y: auto;
  max-height: 450px;
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-notifications p {
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  margin: 16px 0 4px;
}

.empty-notifications span {
  font-size: 14px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item.unread {
  background: #fefce8;
}

.notification-item.unread:hover {
  background: #fef9c3;
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.severity-critical {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.severity-high {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.severity-medium {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.severity-low {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-description {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 8px;
}

.notification-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.notification-time,
.notification-source {
  display: flex;
  align-items: center;
  gap: 4px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
}

.notifications-footer {
  padding: 12px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.btn-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-footer:hover {
  border-color: #667eea;
  color: #667eea;
}

.divider {
  width: 1px;
  height: 30px;
  background: #e2e8f0;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

/* Transitions */
.slide-fade-enter-active {
  animation: slideDown 0.3s ease-out;
}

.slide-fade-leave-active {
  animation: slideUp 0.2s ease-in;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Scrollbar */
.notifications-body::-webkit-scrollbar {
  width: 6px;
}

.notifications-body::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.notifications-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.notifications-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .btn-menu {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-box {
    width: 200px;
  }

  .company-info {
    display: none;
  }

  .notifications-panel {
    width: calc(100vw - 32px);
    right: -16px;
  }
}

@media (max-width: 480px) {
  .search-box {
    display: none;
  }

  .notifications-panel {
    width: calc(100vw - 16px);
    right: -8px;
  }
}
</style>