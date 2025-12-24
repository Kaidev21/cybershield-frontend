<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <Shield class="logo-icon" />
      <div class="logo-text">
        <h2>CyberShield</h2>
        <span>v2.2</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="active"
      >
        <component :is="item.icon" :size="20" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">
          {{ authStore.user?.name?.[0] || 'Y' }}
        </div>
        <div class="user-details">
          <div class="user-name">{{ authStore.user?.name }}</div>
          <div class="user-email">{{ authStore.user?.email }}</div>
        </div>
      </div>
      <button @click="handleLogout" class="btn-logout">
        <LogOut :size="18" />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import {
  Shield,
  LayoutDashboard,
  ScanSearch,
  Bug,
  Bell,
  FileText,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/scans', label: 'Scans', icon: ScanSearch },
  { path: '/vulnerabilities', label: 'Vulnérabilités', icon: Bug },
  { path: '/alerts', label: 'Alertes', icon: Bell },
  { path: '/reports', label: 'Rapports', icon: FileText },
  { path: '/settings', label: 'Paramètres', icon: SettingsIcon }
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  width: 36px;
  height: 36px;
  color: #667eea;
}

.logo-text h2 {
  font-size: 20px;
  color: white;
  margin: 0;
}

.logo-text span {
  font-size: 12px;
  color: #94a3b8;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  color: #94a3b8;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-logout {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.2);
}
</style>