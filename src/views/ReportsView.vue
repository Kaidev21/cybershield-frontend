<template>
  <div class="page-container">
    <Sidebar />
    <div class="main-content">
      <Navbar />

      <div class="reports-page">
        <div class="page-header">
          <div>
            <h1>Rapports</h1>
            <p>Générez et exportez vos rapports de sécurité</p>
          </div>
        </div>

        <!-- Generate Report Card -->
        <div class="card">
          <h3>
            <FileBarChart :size="20" />
            Générer un Nouveau Rapport
          </h3>

          <div class="form-grid">
            <div class="form-group">
              <label>Type de rapport</label>
              <select v-model="reportConfig.type" class="form-control">
                <option value="full">Rapport complet</option>
                <option value="vulnerabilities">Vulnérabilités uniquement</option>
                <option value="scans">Scans uniquement</option>
                <option value="alerts">Alertes uniquement</option>
                <option value="compliance">Conformité</option>
              </select>
            </div>

            <div class="form-group">
              <label>Période</label>
              <select v-model="reportConfig.period" class="form-control">
                <option value="today">Aujourd'hui</option>
                <option value="week">Dernière semaine</option>
                <option value="month">Dernier mois</option>
                <option value="quarter">Dernier trimestre</option>
                <option value="year">Dernière année</option>
                <option value="custom">Période personnalisée</option>
              </select>
            </div>

            <div class="form-group">
              <label>Format</label>
              <select v-model="reportConfig.format" class="form-control">
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xlsx">Excel (XLSX)</option>
              </select>
            </div>
          </div>

          <!-- Custom Date Range -->
          <div v-if="reportConfig.period === 'custom'" class="form-grid">
            <div class="form-group">
              <label>Date de début</label>
              <input v-model="reportConfig.startDate" type="date" class="form-control" />
            </div>
            <div class="form-group">
              <label>Date de fin</label>
              <input v-model="reportConfig.endDate" type="date" class="form-control" />
            </div>
          </div>

          <!-- Report Options -->
          <div class="report-options">
            <h4>Options du rapport</h4>
            <div class="options-grid">
              <label class="checkbox-option">
                <input v-model="reportConfig.includeCharts" type="checkbox" />
                <span>Inclure les graphiques</span>
              </label>
              <label class="checkbox-option">
                <input v-model="reportConfig.includeRecommendations" type="checkbox" />
                <span>Inclure les recommandations</span>
              </label>
              <label class="checkbox-option">
                <input v-model="reportConfig.includeExecutiveSummary" type="checkbox" />
                <span>Résumé exécutif</span>
              </label>
              <label class="checkbox-option">
                <input v-model="reportConfig.includeDetailedFindings" type="checkbox" />
                <span>Détails complets</span>
              </label>
            </div>
          </div>

          <div class="actions">
            <button @click="previewReport" class="btn btn-secondary">
              <Eye :size="20" />
              Aperçu
            </button>
            <button @click="generateReport" class="btn btn-primary" :disabled="generating">
              <FileDown :size="20" />
              <span v-if="!generating">Générer le Rapport</span>
              <span v-else>Génération en cours...</span>
            </button>
          </div>
        </div>

        <!-- Recent Reports -->
        <div class="card">
          <h3>
            <FileText :size="20" />
            Rapports Récents
          </h3>

          <div v-if="recentReports.length === 0" class="empty-state">
            <FileText :size="48" />
            <p>Aucun rapport généré</p>
          </div>

          <div v-else class="reports-list">
            <div v-for="report in recentReports" :key="report.id" class="report-item">
              <div class="report-icon" :class="`format-${report.format}`">
                <component :is="getFormatIcon(report.format)" :size="24" />
              </div>

              <div class="report-info">
                <div class="report-name">{{ report.name }}</div>
                <div class="report-meta">
                  <span class="report-type">{{ getTypeLabel(report.type) }}</span>
                  <span class="report-date">{{ formatDate(report.date) }}</span>
                  <span class="report-size">{{ report.size }}</span>
                </div>
              </div>

              <div class="report-actions">
                <button @click="downloadReport(report)" class="btn-icon" title="Télécharger">
                  <Download :size="20" />
                </button>
                <button @click="shareReport(report)" class="btn-icon" title="Partager">
                  <Share2 :size="20" />
                </button>
                <button @click="deleteReport(report.id)" class="btn-icon danger" title="Supprimer">
                  <Trash2 :size="20" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Report Statistics -->
        <div class="card">
          <h3>
            <BarChart3 :size="20" />
            Statistiques des Rapports
          </h3>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">{{ totalReports }}</div>
              <div class="stat-label">Total Généré</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ reportsThisMonth }}</div>
              <div class="stat-label">Ce Mois-ci</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ totalSize }}</div>
              <div class="stat-label">Taille Totale</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ mostUsedFormat }}</div>
              <div class="stat-label">Format Favori</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FileDown, Download, FileText, Eye, Share2, Trash2, FileBarChart, BarChart3 } from 'lucide-vue-next'
import { formatDate } from '../utils/helpers'
import Sidebar from '../components/layout/Sidebar.vue'
import Navbar from '../components/layout/Navbar.vue'

const reportConfig = ref({
  type: 'full',
  period: 'month',
  format: 'pdf',
  startDate: '',
  endDate: '',
  includeCharts: true,
  includeRecommendations: true,
  includeExecutiveSummary: true,
  includeDetailedFindings: false
})

const generating = ref(false)

const recentReports = ref([
  {
    id: 1,
    name: 'Rapport-Securite-Novembre-2024.pdf',
    type: 'full',
    format: 'pdf',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    size: '2.4 MB'
  },
  {
    id: 2,
    name: 'Vulnerabilites-Octobre-2024.csv',
    type: 'vulnerabilities',
    format: 'csv',
    date: new Date(Date.now() - 86400000 * 35).toISOString(),
    size: '156 KB'
  },
  {
    id: 3,
    name: 'Scans-Septembre-2024.pdf',
    type: 'scans',
    format: 'pdf',
    date: new Date(Date.now() - 86400000 * 65).toISOString(),
    size: '1.8 MB'
  },
  {
    id: 4,
    name: 'Rapport-Conformite-Q3-2024.xlsx',
    type: 'compliance',
    format: 'xlsx',
    date: new Date(Date.now() - 86400000 * 95).toISOString(),
    size: '542 KB'
  }
])

const totalReports = computed(() => recentReports.value.length)
const reportsThisMonth = computed(() => 3)
const totalSize = computed(() => '4.9 MB')
const mostUsedFormat = computed(() => 'PDF')

const getFormatIcon = (format) => {
  const icons = {
    pdf: FileText,
    csv: FileBarChart,
    json: FileText,
    xlsx: FileBarChart
  }
  return icons[format] || FileText
}

const getTypeLabel = (type) => {
  const labels = {
    full: 'Complet',
    vulnerabilities: 'Vulnérabilités',
    scans: 'Scans',
    alerts: 'Alertes',
    compliance: 'Conformité'
  }
  return labels[type] || type
}

const generateReport = async () => {
  generating.value = true

  // Simulation de génération
  await new Promise(resolve => setTimeout(resolve, 2000))

  alert(`Rapport ${reportConfig.value.type} généré en format ${reportConfig.value.format}!\n\nLe téléchargement va commencer...`)

  generating.value = false
}

const previewReport = () => {
  alert('Aperçu du rapport (fonctionnalité à implémenter avec votre backend)')
}

const downloadReport = (report) => {
  alert(`Téléchargement de ${report.name}...`)
}

const shareReport = (report) => {
  alert(`Partage de ${report.name} (fonctionnalité à implémenter)`)
}

const deleteReport = (reportId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
    const index = recentReports.value.findIndex(r => r.id === reportId)
    if (index > -1) {
      recentReports.value.splice(index, 1)
      alert('Rapport supprimé avec succès')
    }
  }
}
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

.reports-page {
  padding: 32px;
}

.page-header {
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

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.card h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #334155;
  font-size: 14px;
}

.form-control {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.report-options {
  background: #f8fafc;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.report-options h4 {
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 16px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
}

.checkbox-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
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

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.2s;
}

.report-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.report-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.format-pdf {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.format-csv {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.format-json {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.format-xlsx {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.report-info {
  flex: 1;
}

.report-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.report-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.report-type {
  padding: 2px 8px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 6px;
  font-weight: 600;
}

.report-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border: 2px solid #e2e8f0;
}

.btn-icon:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-icon.danger:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-box {
  background: #f8fafc;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .reports-page {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .report-item {
    flex-direction: column;
    text-align: center;
  }

  .report-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>