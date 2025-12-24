<template>
  <div class="system-status">
    <div
        v-for="system in systems"
        :key="system.name"
        class="system-item"
    >
      <div class="system-info">
        <div class="system-name">{{ system.name }}</div>
        <div class="system-type">{{ system.type }}</div>
      </div>
      <div class="system-health">
        <div class="health-bar">
          <div
              class="health-fill"
              :style="{ width: system.health + '%', backgroundColor: getHealthColor(system.health) }"
          ></div>
        </div>
        <span class="health-value">{{ system.health }}%</span>
      </div>
      <div class="system-status-badge" :class="`status-${system.status}`">
        <div class="status-dot"></div>
        {{ system.status }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const systems = ref([
  { name: 'Server-01', type: 'Production', health: 98, status: 'online' },
  { name: 'Server-02', type: 'Backup', health: 95, status: 'online' },
  { name: 'Web-App-01', type: 'Application', health: 89, status: 'online' },
  { name: 'Database-01', type: 'Database', health: 92, status: 'online' }
])

const getHealthColor = (health) => {
  if (health >= 90) return '#10b981'
  if (health >= 70) return '#3b82f6'
  if (health >= 50) return '#f59e0b'
  return '#ef4444'
}
</script>

<style scoped>
.system-status {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.system-item {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.system-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.system-type {
  font-size: 12px;
  color: #64748b;
}

.system-health {
  display: flex;
  align-items: center;
  gap: 12px;
}

.health-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.health-value {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  min-width: 40px;
}

.system-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  justify-content: center;
}

.status-online {
  background: #d1fae5;
  color: #065f46;
}

.status-offline {
  background: #fee2e2;
  color: #991b1b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>