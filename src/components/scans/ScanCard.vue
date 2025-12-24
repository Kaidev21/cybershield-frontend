<template>
  <div class="scan-card" :class="`status-${scan.status}`">
    <div class="scan-header">
      <div class="scan-type-badge">
        <component :is="getScanIcon(scan.type)" :size="16" />
        {{ scan.type }}
      </div>
      <div class="scan-status-badge" :class="`badge-${scan.status}`">
        {{ getStatusLabel(scan.status) }}
      </div>
    </div>

    <h3 class="scan-name">{{ scan.name }}</h3>
    <div class="scan-target">
      <Target :size="14" />
      {{ scan.target }}
    </div>

    <div v-if="scan.status === 'running'" class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: scan.progress + '%' }"></div>
      </div>
      <div class="progress-text">{{ scan.progress }}%</div>
    </div>

    <div v-else-if="scan.status === 'completed'" class="scan-results">
      <div class="result-item">
        <FileSearch :size="16" />
        <span>{{ scan.findings }} découvertes</span>
      </div>
      <div class="result-item warning">
        <AlertTriangle :size="16" />
        <span>{{ scan.vulnerabilities }} vulnérabilités</span>
      </div>
    </div>

    <div class="scan-footer">
      <div class="scan-date">
        <Clock :size="14" />
        {{ formatDate(scan.startDate) }}
      </div>
      <div class="scan-actions">
        <button v-if="scan.status === 'running'" @click="$emit('stop')" class="btn-icon danger">
          <StopCircle :size="18" />
        </button>
        <button v-else-if="scan.status === 'completed'" class="btn-icon primary">
          <Eye :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Target, Clock, FileSearch, AlertTriangle, StopCircle, Eye, Network, Globe } from 'lucide-vue-next'
import { formatDate } from '../../utils/helpers'

defineProps({
  scan: {
    type: Object,
    required: true
  }
})

defineEmits(['stop'])

const getScanIcon = (type) => {
  return type === 'network' ? Network : Globe
}

const getStatusLabel = (status) => {
  const labels = {
    running: 'En cours',
    completed: 'Terminé',
    pending: 'En attente',
    failed: 'Échoué',
    stopped: 'Arrêté'
  }
  return labels[status] || status
}
</script>

<style scoped>
.scan-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  border-left: 4px solid #e2e8f0;
}

.scan-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.scan-card.status-running {
  border-left-color: #3b82f6;
}

.scan-card.status-completed {
  border-left-color: #10b981;
}

.scan-card.status-failed {
  border-left-color: #ef4444;
}

.scan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.scan-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  text-transform: capitalize;
}

.scan-status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-running {
  background: #dbeafe;
  color: #1e40af;
}

.badge-completed {
  background: #d1fae5;
  color: #065f46;
}

.badge-failed {
  background: #fee2e2;
  color: #991b1b;
}

.badge-pending {
  background: #fef3c7;
  color: #92400e;
}

.scan-name {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.scan-target {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 16px;
  font-family: monospace;
}

.progress-section {
  margin-bottom: 16px;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
}

.scan-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 13px;
  color: #64748b;
}

.result-item.warning {
  color: #f59e0b;
  background: #fffbeb;
}

.scan-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.scan-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
}

.scan-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon.primary {
  background: #dbeafe;
  color: #1e40af;
}

.btn-icon.primary:hover {
  background: #bfdbfe;
}

.btn-icon.danger {
  background: #fee2e2;
  color: #991b1b;
}

.btn-icon.danger:hover {
  background: #fecaca;
}
</style>