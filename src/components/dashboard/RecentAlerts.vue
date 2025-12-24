<template>
  <div class="recent-alerts">
    <div v-if="alerts.length === 0" class="empty-state">
      Aucune alerte récente
    </div>
    <div v-else class="alerts-list">
      <div
          v-for="alert in displayedAlerts"
          :key="alert.id"
          class="alert-item"
          :class="`severity-${alert.severity}`"
      >
        <div class="alert-icon">
          <component :is="getAlertIcon(alert.type)" :size="20" />
        </div>
        <div class="alert-content">
          <div class="alert-title">{{ alert.title }}</div>
          <div class="alert-time">{{ formatDateShort(alert.timestamp) }}</div>
        </div>
        <div class="alert-badge">
          <span :class="`badge badge-${alert.severity}`">
            {{ alert.severity }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAlertsStore } from '../../stores/alerts'
import { Shield, Bug, Activity, AlertTriangle } from 'lucide-vue-next'
import { formatDateShort } from '../../utils/helpers'

const props = defineProps({
  limit: {
    type: Number,
    default: 5
  }
})

const alertsStore = useAlertsStore()

const alerts = computed(() => alertsStore.alerts)
const displayedAlerts = computed(() => alerts.value.slice(0, props.limit))

const getAlertIcon = (type) => {
  const icons = {
    intrusion: Shield,
    vulnerability: Bug,
    anomaly: Activity,
    system: AlertTriangle
  }
  return icons[type] || AlertTriangle
}
</script>

<style scoped>
.recent-alerts {
  min-height: 200px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #94a3b8;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 4px solid;
  transition: all 0.2s;
}

.alert-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.alert-item.severity-critical {
  border-color: #ef4444;
}

.alert-item.severity-high {
  border-color: #f59e0b;
}

.alert-item.severity-medium {
  border-color: #3b82f6;
}

.alert-item.severity-low {
  border-color: #10b981;
}

.alert-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #64748b;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  margin-bottom: 4px;
}

.alert-time {
  font-size: 12px;
  color: #64748b;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-critical {
  background: #fee2e2;
  color: #991b1b;
}

.badge-high {
  background: #fef3c7;
  color: #92400e;
}

.badge-medium {
  background: #dbeafe;
  color: #1e40af;
}

.badge-low {
  background: #d1fae5;
  color: #065f46;
}
</style>