<template>
  <div class="alert-list">
    <div v-if="alerts.length === 0" class="empty-state">
      <Bell :size="48" />
      <p>Aucune alerte disponible</p>
    </div>

    <div v-else class="alerts-container">
      <div
          v-for="alert in alerts"
          :key="alert.id"
          class="alert-card"
          :class="[`severity-${alert.severity}`, { acknowledged: alert.acknowledged }]"
      >
        <div class="alert-icon-container" :class="`icon-${alert.severity}`">
          <component :is="getAlertIcon(alert.type)" :size="24" />
        </div>

        <div class="alert-content">
          <div class="alert-header">
            <h4>{{ alert.title }}</h4>
            <div class="alert-meta">
              <span class="alert-source">{{ alert.source }}</span>
              <span class="alert-time">{{ formatDateShort(alert.timestamp) }}</span>
            </div>
          </div>

          <p class="alert-description">{{ alert.description }}</p>

          <div class="alert-badges">
            <span class="badge" :class="`badge-${alert.type}`">
              {{ alert.type }}
            </span>
            <span class="badge" :class="`badge-${alert.severity}`">
              {{ alert.severity }}
            </span>
          </div>
        </div>

        <div class="alert-actions">
          <button
              v-if="!alert.acknowledged"
              @click="$emit('acknowledge', alert.id)"
              class="btn-ack"
              title="Marquer comme traitée"
          >
            <Check :size="18" />
          </button>
          <button
              class="btn-view"
              title="Voir les détails"
              @click.stop="showDetails(alert)">
            <Eye :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Alert Details Modal -->
  <AlertDetails
      v-if="selectedAlert"
      :alert="selectedAlert"
      @close="selectedAlert = null"
      @acknowledge="handleAcknowledge"
      @unacknowledge="handleUnacknowledge"
  />
</template>

<script setup>
import { Bell, Shield, Bug, Activity, AlertTriangle, Check, Eye } from 'lucide-vue-next'
import { formatDateShort } from '../../utils/helpers'
import AlertDetails from './AlertDetails.vue'
import {ref} from "vue";

defineProps({
  alerts: {
    type: Array,
    default: () => []
  },
  selectedAlerts: {
    type: Array,
    default: () => []
  }
})

defineEmits(['acknowledge', 'select'])

const selectedAlert = ref(null)

const showDetails = (alert) => {
  selectedAlert.value = alert
}

const handleAcknowledge = (alertId) => {
  emit('acknowledge', alertId)
  selectedAlert.value = null
}

const handleUnacknowledge = (alertId) => {
  // Émettre l'événement pour réactiver l'alerte
  emit('unacknowledge', alertId)
  selectedAlert.value = null
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

const getSeverityLabel = (severity) => {
  const labels = {
    critical: 'Critique',
    high: 'Élevée',
    medium: 'Moyenne',
    low: 'Faible'
  }
  return labels[severity] || severity
}

const getTypeLabel = (type) => {
  const labels = {
    intrusion: 'Intrusion',
    vulnerability: 'Vulnérabilité',
    anomaly: 'Anomalie',
    system: 'Système'
  }
  return labels[type] || type
}

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
.alert-list {
  min-height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #94a3b8;
}

.empty-state p {
  margin-top: 16px;
  font-size: 16px;
}

.alerts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alert-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  transition: all 0.2s;
}

.alert-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateX(4px);
}

.alert-card.severity-critical {
  border-left-color: #ef4444;
}

.alert-card.severity-high {
  border-left-color: #f59e0b;
}

.alert-card.severity-medium {
  border-left-color: #3b82f6;
}

.alert-card.severity-low {
  border-left-color: #10b981;
}

.alert-card.acknowledged {
  opacity: 0.6;
}

.alert-icon-container {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-critical {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.icon-high {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.icon-medium {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.icon-low {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.alert-content {
  flex: 1;
}

.alert-header {
  margin-bottom: 8px;
}

.alert-header h4 {
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 4px;
}

.alert-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.alert-source {
  font-weight: 600;
}

.alert-description {
  color: #64748b;
  margin-bottom: 12px;
  line-height: 1.5;
  font-size: 14px;
}

.alert-badges {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-intrusion {
  background: #dbeafe;
  color: #1e40af;
}

.badge-vulnerability {
  background: #fee2e2;
  color: #991b1b;
}

.badge-anomaly {
  background: #fef3c7;
  color: #92400e;
}

.badge-system {
  background: #f3e8ff;
  color: #6b21a8;
}

.alert-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-ack,
.btn-view {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-ack {
  background: #d1fae5;
  color: #065f46;
}

.btn-ack:hover {
  background: #a7f3d0;
}

.btn-view {
  background: #dbeafe;
  color: #1e40af;
}

.btn-view:hover {
  background: #bfdbfe;
}
</style>