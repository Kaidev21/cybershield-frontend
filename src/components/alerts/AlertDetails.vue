<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <div class="alert-type-badge" :class="`type-${alert.type}`">
            {{ getTypeLabel(alert.type) }}
          </div>
          <h2>{{ alert.title }}</h2>
        </div>
        <button @click="$emit('close')" class="btn-close">
          <X :size="20" />
        </button>
      </div>

      <div class="modal-body">
        <!-- Severity & Status -->
        <div class="info-grid">
          <div class="info-card">
            <div class="info-label">Sévérité</div>
            <span class="severity-badge-large" :class="`badge-${alert.severity}`">
              <component :is="getSeverityIcon(alert.severity)" :size="20" />
              {{ getSeverityLabel(alert.severity) }}
            </span>
          </div>
          <div class="info-card">
            <div class="info-label">Source</div>
            <div class="source-info">
              <Server :size="18" />
              {{ alert.source }}
            </div>
          </div>
          <div class="info-card">
            <div class="info-label">Statut</div>
            <span class="status-badge" :class="{ acknowledged: alert.acknowledged }">
              <component :is="alert.acknowledged ? CheckCircle : Clock" :size="18" />
              {{ alert.acknowledged ? 'Traitée' : 'Active' }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div class="section">
          <h3><FileText :size="18" /> Description</h3>
          <p class="description">{{ alert.description }}</p>
        </div>

        <!-- Alert Details -->
        <div class="section">
          <h3><Info :size="18" /> Détails de l'alerte</h3>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Type d'alerte:</span>
              <span class="detail-value">{{ getTypeLabel(alert.type) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Détectée le:</span>
              <span class="detail-value">{{ formatDate(alert.timestamp) }}</span>
            </div>
            <div v-if="alert.ipAddress" class="detail-item">
              <span class="detail-label">Adresse IP:</span>
              <span class="detail-value code">{{ alert.ipAddress }}</span>
            </div>
            <div v-if="alert.affectedAsset" class="detail-item">
              <span class="detail-label">Actif affecté:</span>
              <span class="detail-value">{{ alert.affectedAsset }}</span>
            </div>
          </div>
        </div>

        <!-- Recommendation -->
        <div class="section recommendation" :class="`severity-${alert.severity}`">
          <h3><Lightbulb :size="18" /> Actions recommandées</h3>
          <p>{{ getRecommendation(alert) }}</p>
        </div>

        <!-- Timeline -->
        <div class="section">
          <h3><Clock :size="18" /> Chronologie</h3>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-label">Alerte détectée</div>
                <div class="timeline-date">{{ formatDate(alert.timestamp) }}</div>
              </div>
            </div>
            <div v-if="alert.acknowledged" class="timeline-item">
              <div class="timeline-dot acknowledged"></div>
              <div class="timeline-content">
                <div class="timeline-label">Alerte traitée</div>
                <div class="timeline-date">{{ formatDate(alert.acknowledgedAt) }}</div>
                <div v-if="alert.acknowledgedBy" class="timeline-meta">
                  Par {{ alert.acknowledgedBy }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Events (if any) -->
        <div v-if="alert.relatedEvents && alert.relatedEvents.length > 0" class="section">
          <h3><Link :size="18" /> Événements liés</h3>
          <div class="related-events">
            <div v-for="event in alert.relatedEvents" :key="event.id" class="event-item">
              <Activity :size="16" />
              <div class="event-info">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-time">{{ formatDate(event.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">
          Fermer
        </button>
        <button
            v-if="!alert.acknowledged"
            class="btn btn-primary"
            @click="handleAcknowledge"
        >
          <CheckCircle :size="18" />
          Marquer comme traitée
        </button>
        <button
            v-else
            class="btn btn-outline"
            @click="handleUnacknowledge"
        >
          <RotateCcw :size="18" />
          Réactiver
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  X,
  FileText,
  Server,
  Lightbulb,
  Clock,
  CheckCircle,
  Info,
  Link,
  Activity,
  RotateCcw,
  AlertOctagon,
  AlertTriangle,
  AlertCircle as AlertCircleIcon,
  InfoIcon
} from 'lucide-vue-next'
import { formatDate } from '../../utils/helpers'

const props = defineProps({
  alert: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'acknowledge', 'unacknowledge'])

const getSeverityIcon = (severity) => {
  const icons = {
    critical: AlertOctagon,
    high: AlertTriangle,
    medium: AlertCircleIcon,
    low: InfoIcon
  }
  return icons[severity] || AlertCircleIcon
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
    intrusion: 'Tentative d\'intrusion',
    vulnerability: 'Vulnérabilité',
    anomaly: 'Anomalie',
    system: 'Système'
  }
  return labels[type] || type
}

const getRecommendation = (alert) => {
  if (alert.recommendation) {
    return alert.recommendation
  }

  // Default recommendations based on severity
  const recommendations = {
    critical: 'Action immédiate requise. Isoler les systèmes affectés et contacter l\'équipe de sécurité.',
    high: 'Intervention urgente nécessaire. Vérifier les logs et appliquer les correctifs de sécurité.',
    medium: 'Investigation recommandée. Surveiller l\'activité et planifier les correctifs appropriés.',
    low: 'Surveillance continue. Documenter l\'incident pour référence future.'
  }

  return recommendations[alert.severity] || 'Consulter les procédures de sécurité standard.'
}

const handleAcknowledge = () => {
  emit('acknowledge', props.alert.id)
}

const handleUnacknowledge = () => {
  emit('unacknowledge', props.alert.id)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 32px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.alert-type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.type-intrusion {
  background: #fee2e2;
  color: #dc2626;
}

.type-vulnerability {
  background: #fed7aa;
  color: #ea580c;
}

.type-anomaly {
  background: #dbeafe;
  color: #2563eb;
}

.type-system {
  background: #e0e7ff;
  color: #4338ca;
}

.modal-header h2 {
  font-size: 24px;
  color: #1e293b;
  margin: 0;
  max-width: 700px;
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.info-card {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.info-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.severity-badge-large {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
}

.badge-critical {
  background: #fee2e2;
  color: #dc2626;
}

.badge-high {
  background: #fed7aa;
  color: #ea580c;
}

.badge-medium {
  background: #dbeafe;
  color: #2563eb;
}

.badge-low {
  background: #d1fae5;
  color: #059669;
}

.source-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #475569;
  font-weight: 600;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  background: #fef3c7;
  color: #92400e;
}

.status-badge.acknowledged {
  background: #d1fae5;
  color: #059669;
}

.section {
  margin-bottom: 32px;
}

.section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 16px;
  font-weight: 600;
}

.description {
  color: #475569;
  line-height: 1.7;
  font-size: 15px;
}

.details-grid {
  display: grid;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.detail-label {
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
}

.detail-value {
  color: #1e293b;
  font-weight: 500;
  font-size: 14px;
}

.detail-value.code {
  font-family: 'Courier New', monospace;
  background: #e0e7ff;
  padding: 2px 8px;
  border-radius: 4px;
  color: #4338ca;
}

.recommendation {
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid;
}

.severity-critical.recommendation {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #ef4444;
}

.severity-critical.recommendation h3 {
  color: #991b1b;
}

.severity-critical.recommendation p {
  color: #7f1d1d;
}

.severity-high.recommendation {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
}

.severity-high.recommendation h3 {
  color: #92400e;
}

.severity-high.recommendation p {
  color: #78350f;
}

.severity-medium.recommendation {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.severity-medium.recommendation h3 {
  color: #1e3a8a;
}

.severity-medium.recommendation p {
  color: #1e40af;
}

.severity-low.recommendation {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
}

.severity-low.recommendation h3 {
  color: #065f46;
}

.severity-low.recommendation p {
  color: #047857;
}

.recommendation p {
  line-height: 1.7;
  font-size: 15px;
  margin: 0;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 20px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 24px;
  width: 2px;
  height: calc(100% + 8px);
  background: #e2e8f0;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f59e0b;
  margin-top: 4px;
  flex-shrink: 0;
  border: 3px solid #fed7aa;
}

.timeline-dot.acknowledged {
  background: #10b981;
  border-color: #d1fae5;
}

.timeline-content {
  flex: 1;
}

.timeline-label {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
  margin-bottom: 4px;
}

.timeline-date {
  color: #64748b;
  font-size: 14px;
}

.timeline-meta {
  color: #64748b;
  font-size: 13px;
  margin-top: 2px;
  font-style: italic;
}

.related-events {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  align-items: start;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.event-item:hover {
  border-color: #667eea;
  background: #f1f5f9;
}

.event-info {
  flex: 1;
}

.event-title {
  color: #1e293b;
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}

.event-time {
  color: #64748b;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 32px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-outline {
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.btn-outline:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-start;
  }

  .modal-card {
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }

  .modal-header h2 {
    font-size: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .detail-item {
    flex-direction: column;
    gap: 8px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>