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
      <button class="icon-btn" title="Notifications">
        <Bell :size="20" />
        <span class="badge">{{ alertsStore.activeAlerts.length }}</span>
      </button>

      <div class="divider"></div>

      <div class="company-info">
        <Building :size="18" />
        <span>{{ authStore.user?.company }}</span>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import { useAlertsStore } from '../../stores/alerts'
import { Menu, Search, Bell, Building } from 'lucide-vue-next'

const authStore = useAuthStore()
const alertsStore = useAlertsStore()

const toggleSidebar = () => {
  // Pour mobile - à implémenter
  console.log('Toggle sidebar')
}
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
}
</style>