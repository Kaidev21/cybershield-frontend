<template>
  <div class="page-container">
    <Sidebar />
    <div class="main-content">
      <Navbar />

      <div class="dashboard">
        <div class="page-header">
          <div>
            <h1>Tableau de Bord</h1>
            <p>Vue d'ensemble de votre posture de sécurité</p>
          </div>
          <button @click="refreshData" class="btn-refresh" :disabled="dashboardStore.loading">
            <RefreshCw :size="20" :class="{ spinning: dashboardStore.loading }" />
            Actualiser
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <StatsCard
              title="Scans Totaux"
              :value="dashboardStore.stats.totalScans"
              icon="scan"
              color="blue"
              :trend="12"
          />
          <StatsCard
              title="Alertes Actives"
              :value="dashboardStore.stats.activeAlerts"
              icon="alert"
              color="orange"
              :trend="-5"
          />
          <StatsCard
              title="Vulnérabilités"
              :value="dashboardStore.stats.vulnerabilities"
              icon="bug"
              color="red"
              :trend="8"
          />
          <StatsCard
              title="Santé Système"
              :value="dashboardStore.stats.systemHealth + '%'"
              icon="heart"
              color="green"
              :trend="3"
          />
        </div>

        <!-- Charts and Recent Activity -->
        <div class="content-grid">
          <!-- Vulnerability Chart -->
          <div class="card chart-card">
            <div class="card-header">
              <h3>
                <BarChart3 :size="20" />
                Vulnérabilités par Sévérité
              </h3>
              <select v-model="chartPeriod" class="period-select">
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>
            <VulnerabilityChart />
          </div>

          <!-- Recent Alerts -->
          <div class="card">
            <div class="card-header">
              <h3>
                <Bell :size="20" />
                Activité Récente
              </h3>
              <router-link to="/alerts" class="link-view-all">
                Voir tout
                <ArrowRight :size="16" />
              </router-link>
            </div>
            <RecentAlerts :limit="5" />
          </div>

          <!-- System Status -->
          <div class="card">
            <div class="card-header">
              <h3>
                <Activity :size="20" />
                État des Systèmes
              </h3>
              <span class="status-indicator online">
                <div class="status-dot"></div>
                Tous opérationnels
              </span>
            </div>
            <SystemStatus />
          </div>

          <!-- Quick Actions -->
          <div class="card quick-actions-card">
            <h3>
              <Zap :size="20" />
              Actions Rapides
            </h3>
            <div class="actions-grid">
              <button @click="$router.push('/scans')" class="action-btn">
                <div class="action-icon blue">
                  <ScanSearch :size="24" />
                </div>
                <div class="action-content">
                  <div class="action-title">Nouveau Scan</div>
                  <div class="action-desc">Lancer une analyse</div>
                </div>
              </button>

              <button @click="$router.push('/vulnerabilities')" class="action-btn">
                <div class="action-icon red">
                  <Bug :size="24" />
                </div>
                <div class="action-content">
                  <div class="action-title">Vulnérabilités</div>
                  <div class="action-desc">Consulter les CVE</div>
                </div>
              </button>

              <button @click="$router.push('/reports')" class="action-btn">
                <div class="action-icon green">
                  <FileText :size="24" />
                </div>
                <div class="action-content">
                  <div class="action-title">Rapports</div>
                  <div class="action-desc">Générer un rapport</div>
                </div>
              </button>

              <button @click="$router.push('/settings')" class="action-btn">
                <div class="action-icon purple">
                  <Settings :size="24" />
                </div>
                <div class="action-content">
                  <div class="action-title">Paramètres</div>
                  <div class="action-desc">Configurer</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Security Score -->
          <div class="card security-score-card">
            <h3>
              <Shield :size="20" />
              Score de Sécurité
            </h3>
            <div class="score-container">
              <div class="score-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" class="score-bg"></circle>
                  <circle
                      cx="50"
                      cy="50"
                      r="45"
                      class="score-progress"
                      :style="{ strokeDashoffset: scoreOffset }"
                  ></circle>
                </svg>
                <div class="score-value">{{ securityScore }}</div>
              </div>
              <div class="score-details">
                <div class="score-item">
                  <CheckCircle :size="16" class="text-green" />
                  <span>Protections actives: 12/15</span>
                </div>
                <div class="score-item">
                  <AlertCircle :size="16" class="text-orange" />
                  <span>Actions requises: 3</span>
                </div>
                <div class="score-item">
                  <TrendingUp :size="16" class="text-blue" />
                  <span>Amélioration: +8% ce mois</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Scans -->
          <div class="card">
            <div class="card-header">
              <h3>
                <ScanSearch :size="20" />
                Scans Récents
              </h3>
              <router-link to="/scans" class="link-view-all">
                Voir tout
                <ArrowRight :size="16" />
              </router-link>
            </div>
            <div class="recent-scans-list">
              <div v-for="scan in recentScans" :key="scan.id" class="scan-item">
                <div class="scan-info">
                  <div class="scan-name">{{ scan.name }}</div>
                  <div class="scan-meta">
                    <span class="scan-type">{{ scan.type }}</span>
                    <span class="scan-date">{{ formatDateShort(scan.date) }}</span>
                  </div>
                </div>
                <span class="scan-status" :class="scan.status">
                  {{ scan.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { formatDateShort } from '../utils/helpers'
import {
  RefreshCw,
  BarChart3,
  Bell,
  Activity,
  Zap,
  Shield,
  ScanSearch,
  Bug,
  FileText,
  Settings,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-vue-next'
import Sidebar from '../components/layout/Sidebar.vue'
import Navbar from '../components/layout/Navbar.vue'
import StatsCard from '../components/dashboard/StatsCard.vue'
import VulnerabilityChart from '../components/dashboard/VulnerabilityChart.vue'
import RecentAlerts from '../components/dashboard/RecentAlerts.vue'
import SystemStatus from '../components/dashboard/SystemStatus.vue'

const dashboardStore = useDashboardStore()

const chartPeriod = ref('month')
const securityScore = ref(85)

const recentScans = ref([
  {
    id: 1,
    name: 'Scan réseau production',
    type: 'network',
    date: new Date(Date.now() - 3600000).toISOString(),
    status: 'completed'
  },
  {
    id: 2,
    name: 'Scan applicatif web',
    type: 'application',
    date: new Date(Date.now() - 7200000).toISOString(),
    status: 'running'
  },
  {
    id: 3,
    name: 'Audit de sécurité',
    type: 'full',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed'
  }
])

const scoreOffset = computed(() => {
  const circumference = 2 * Math.PI * 45
  return circumference - (securityScore.value / 100) * circumference
})

const refreshData = async () => {
  await dashboardStore.fetchDashboardData()
}

onMounted(() => {
  dashboardStore.fetchDashboardData()
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

.dashboard {
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

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: #1e293b;
  margin: 0;
}

.chart-card {
  grid-column: span 8;
}

.card:nth-child(2) {
  grid-column: span 4;
}

.card:nth-child(3) {
  grid-column: span 6;
}

.quick-actions-card {
  grid-column: span 6;
}

.security-score-card {
  grid-column: span 6;
}

.card:nth-child(6) {
  grid-column: span 6;
}

.period-select {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  background: white;
}

.period-select:focus {
  outline: none;
  border-color: #667eea;
}

.link-view-all {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: gap 0.2s;
}

.link-view-all:hover {
  gap: 10px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
}

.status-indicator.online {
  color: #10b981;
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

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.action-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-icon.blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.action-icon.red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.action-icon.green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.action-icon.purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.action-title {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 13px;
  color: #64748b;
}

.score-container {
  display: flex;
  gap: 32px;
  align-items: center;
  margin-top: 24px;
}

.score-circle {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.score-circle svg {
  transform: rotate(-90deg);
}

.score-bg {
  fill: none;
  stroke: #f1f5f9;
  stroke-width: 8;
}

.score-progress {
  fill: none;
  stroke: url(#gradient);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s ease;
}

.score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
}

.score-value::after {
  content: '%';
  font-size: 20px;
  color: #64748b;
}

.score-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #64748b;
}

.text-green { color: #10b981; }
.text-orange { color: #f59e0b; }
.text-blue { color: #3b82f6; }

.recent-scans-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.2s;
}

.scan-item:hover {
  background: #f1f5f9;
}

.scan-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.scan-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.scan-type {
  padding: 2px 8px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 6px;
  font-weight: 600;
  text-transform: capitalize;
}

.scan-status {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.scan-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.scan-status.running {
  background: #dbeafe;
  color: #1e40af;
}

.scan-status.failed {
  background: #fee2e2;
  color: #991b1b;
}

@media (max-width: 1400px) {
  .chart-card {
    grid-column: span 12;
  }

  .card:nth-child(2),
  .card:nth-child(3),
  .quick-actions-card,
  .security-score-card,
  .card:nth-child(6) {
    grid-column: span 6;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .dashboard {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    display: flex;
    flex-direction: column;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .score-container {
    flex-direction: column;
  }
}
</style>