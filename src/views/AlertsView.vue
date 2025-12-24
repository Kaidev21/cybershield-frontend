<template>
  <div class="page-container">
    <Sidebar />
    <div class="main-content">
      <Navbar />

      <div class="alerts-page">
        <div class="page-header">
          <div>
            <h1>Alertes de Sécurité</h1>
            <p>Gérez vos alertes et notifications</p>
          </div>
          <div class="header-actions">
            <button @click="showSettings = !showSettings" class="btn btn-secondary">
              <Settings :size="20" />
              Paramètres
            </button>
            <button @click="refreshAlerts" class="btn btn-primary" :disabled="alertsStore.loading">
              <RefreshCw :size="20" :class="{ spinning: alertsStore.loading }" />
              Actualiser
            </button>
          </div>
        </div>

        <!-- Alert Summary -->
        <div class="alert-summary">
          <div class="summary-card critical" @click="filterBySeverity('critical')">
            <div class="summary-icon">
              <AlertOctagon :size="28" />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ getCriticalCount }}</div>
              <div class="summary-label">Critiques</div>
            </div>
          </div>

          <div class="summary-card high" @click="filterBySeverity('high')">
            <div class="summary-icon">
              <AlertTriangle :size="28" />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ getHighCount }}</div>
              <div class="summary-label">Élevées</div>
            </div>
          </div>

          <div class="summary-card medium" @click="filterBySeverity('medium')">
            <div class="summary-icon">
              <AlertCircle :size="28" />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ getMediumCount }}</div>
              <div class="summary-label">Moyennes</div>
            </div>
          </div>

          <div class="summary-card active" @click="setFilter('active')">
            <div class="summary-icon">
              <Activity :size="28" />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ alertsStore.activeAlerts.length }}</div>
              <div class="summary-label">Actives</div>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="filters-bar">
          <div class="filter-tabs">
            <button
                @click="activeTab = 'all'"
                class="filter-tab"
                :class="{ active: activeTab === 'all' }"
            >
              <Globe :size="18" />
              Toutes ({{ alertsStore.alerts.length }})
            </button>
            <button
                @click="activeTab = 'active'"
                class="filter-tab"
                :class="{ active: activeTab === 'active' }"
            >
              <Bell :size="18" />
              Actives ({{ alertsStore.activeAlerts.length }})
            </button>
            <button
                @click="activeTab = 'acknowledged'"
                class="filter-tab"
                :class="{ active: activeTab === 'acknowledged' }"
            >
              <CheckCircle :size="18" />
              Traitées
            </button>
          </div>

          <div class="filter-controls">
            <select v-model="severityFilter" class="filter-select">
              <option value="">Toutes les sévérités</option>
              <option value="critical">Critique</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>

            <select v-model="typeFilter" class="filter-select">
              <option value="">Tous les types</option>
              <option value="intrusion">Intrusion</option>
              <option value="vulnerability">Vulnérabilité</option>
              <option value="anomaly">Anomalie</option>
              <option value="system">Système</option>
            </select>

            <div class="search-box">
              <Search :size="18" />
              <input v-model="searchQuery" type="text" placeholder="Rechercher..." />
            </div>
          </div>

          <div class="bulk-actions" v-if="selectedAlerts.length > 0">
            <span class="selected-count">{{ selectedAlerts.length }} alerte(s) sélectionnée(s)</span>
            <button @click="acknowledgeSelected" class="btn-bulk">
              <Check :size="18" />
              Marquer comme traitées
            </button>
            <button @click="deleteSelected" class="btn-bulk danger">
              <Trash2 :size="18" />
              Supprimer
            </button>
            <button @click="clearSelection" class="btn-bulk">
              <X :size="18" />
              Annuler
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="alertsStore.loading" class="loading-container">
          <div class="spinner-large"></div>
          <p>Chargement des alertes...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredAlerts.length === 0" class="empty-state">
          <Bell :size="64" />
          <h3>{{ activeTab === 'active' ? 'Aucune alerte active' : 'Aucune alerte' }}</h3>
          <p>{{ getEmptyMessage }}</p>
        </div>

        <!-- Alerts List -->
        <div v-else class="alerts-section">
          <div class="alerts-header">
            <label class="checkbox-all">
              <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="toggleSelectAll"
              />
              <span>Tout sélectionner</span>
            </label>
            <span class="alerts-count">
              {{ filteredAlerts.length }} alerte(s)
            </span>
          </div>

          <AlertList
              :alerts="filteredAlerts"
              :selected-alerts="selectedAlerts"
              @acknowledge="handleAcknowledge"
              @select="toggleSelectAlert"
          />
        </div>

        <!-- Settings Modal -->
        <AlertSettings
            v-if="showSettings"
            @close="showSettings = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAlertsStore } from '../stores/alerts'
import {
  Settings,
  RefreshCw,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Activity,
  Globe,
  Bell,
  CheckCircle,
  Search,
  Check,
  Trash2,
  X
} from 'lucide-vue-next'
import Sidebar from '../components/layout/Sidebar.vue'
import Navbar from '../components/layout/Navbar.vue'
import AlertList from '../components/alerts/AlertList.vue'
import AlertSettings from '../components/alerts/AlertSettings.vue'

const alertsStore = useAlertsStore()

const showSettings = ref(false)
const activeTab = ref('all')
const severityFilter = ref('')
const typeFilter = ref('')
const searchQuery = ref('')
const selectedAlerts = ref([])

const filteredAlerts = computed(() => {
  let alerts = []

  // Filter by tab
  if (activeTab.value === 'all') {
    alerts = alertsStore.alerts
  } else if (activeTab.value === 'active') {
    alerts = alertsStore.activeAlerts
  } else if (activeTab.value === 'acknowledged') {
    alerts = alertsStore.alerts.filter(a => a.acknowledged)
  }

  // Filter by severity
  if (severityFilter.value) {
    alerts = alerts.filter(a => a.severity === severityFilter.value)
  }

  // Filter by type
  if (typeFilter.value) {
    alerts = alerts.filter(a => a.type === typeFilter.value)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    alerts = alerts.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.source.toLowerCase().includes(query)
    )
  }

  return alerts
})

const getCriticalCount = computed(() =>
    alertsStore.alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length
)

const getHighCount = computed(() =>
    alertsStore.alerts.filter(a => a.severity === 'high' && !a.acknowledged).length
)

const getMediumCount = computed(() =>
    alertsStore.alerts.filter(a => a.severity === 'medium' && !a.acknowledged).length
)

const getEmptyMessage = computed(() => {
  if (activeTab.value === 'active') {
    return 'Toutes les alertes ont été traitées'
  }
  if (severityFilter.value || typeFilter.value || searchQuery.value) {
    return 'Aucune alerte ne correspond aux filtres sélectionnés'
  }
  return 'Aucune alerte pour le moment'
})

const allSelected = computed(() =>
    filteredAlerts.value.length > 0 &&
    selectedAlerts.value.length === filteredAlerts.value.length
)

const filterBySeverity = (severity) => {
  severityFilter.value = severity === severityFilter.value ? '' : severity
  activeTab.value = 'all'
}

const setFilter = (filter) => {
  activeTab.value = filter
  severityFilter.value = ''
  typeFilter.value = ''
}

const toggleSelectAlert = (alertId) => {
  const index = selectedAlerts.value.indexOf(alertId)
  if (index > -1) {
    selectedAlerts.value.splice(index, 1)
  } else {
    selectedAlerts.value.push(alertId)
  }
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedAlerts.value = []
  } else {
    selectedAlerts.value = filteredAlerts.value.map(a => a.id)
  }
}

const handleAcknowledge = async (alertId) => {
  await alertsStore.acknowledgeAlert(alertId)
}

const acknowledgeSelected = async () => {
  for (const alertId of selectedAlerts.value) {
    await alertsStore.acknowledgeAlert(alertId)
  }
  selectedAlerts.value = []
}

const deleteSelected = () => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedAlerts.value.length} alerte(s) ?`)) {
    // Implémenter la suppression
    selectedAlerts.value = []
  }
}

const clearSelection = () => {
  selectedAlerts.value = []
}

const refreshAlerts = () => {
  alertsStore.fetchAlerts()
}

onMounted(() => {
  alertsStore.fetchAlerts()
})
</script>

<style scoped>
.page-container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  background: #f8fafc;
}

.alerts-page {
  padding: 32px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  color: #1e293b;
  margin-bottom: 8px;
}

.page-header p {
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 12px;
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
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.alert-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.summary-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-card.critical {
  border-color: #ef4444;
}

.summary-card.high {
  border-color: #f59e0b;
}

.summary-card.medium {
  border-color: #3b82f6;
}

.summary-card.active {
  border-color: #10b981;
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.critical .summary-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.high .summary-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.medium .summary-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.active .summary-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.summary-value {
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
}

.summary-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

.filters-bar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
  overflow-x: auto;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-tab:hover {
  background: #f8fafc;
  color: #1e293b;
}

.filter-tab.active {
  background: #e0e7ff;
  color: #4338ca;
}

.filter-controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 180px;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #f8fafc;
  border-radius: 10px;
  flex: 1;
  max-width: 400px;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #1e293b;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.selected-count {
  font-weight: 600;
  color: #667eea;
  margin-right: auto;
}

.btn-bulk {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-bulk:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-bulk.danger:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  color: #64748b;
}

.spinner-large {
  border: 4px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  color: #64748b;
}

.empty-state h3 {
  font-size: 20px;
  color: #1e293b;
  margin: 16px 0 8px;
}

.alerts-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.alerts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.checkbox-all {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.checkbox-all input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.alerts-count {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .alerts-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
  }

  .alert-summary {
    grid-template-columns: 1fr;
  }

  .filter-controls {
    flex-direction: column;
  }

  .filter-select,
  .search-box {
    width: 100%;
    max-width: none;
  }

  .bulk-actions {
    flex-wrap: wrap;
  }
}
</style>