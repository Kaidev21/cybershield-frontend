<template>
  <div class="page-container">
    <Sidebar />
    <div class="main-content">
      <Navbar />

      <div class="vulnerabilities-page">
        <div class="page-header">
          <div>
            <h1>Vulnérabilités</h1>
            <p>Gestion des vulnérabilités détectées</p>
          </div>
          <div class="header-actions">
            <button @click="exportVulnerabilities" class="btn btn-secondary">
              <Download :size="20" />
              Exporter
            </button>
            <button @click="refreshData" class="btn btn-primary" :disabled="vulnStore.loading">
              <RefreshCw :size="20" :class="{ spinning: vulnStore.loading }" />
              Actualiser
            </button>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="vuln-stats">
          <div class="stat-item critical" @click="setSeverityFilter('critical')">
            <div class="stat-icon">
              <AlertOctagon :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ vulnStore.criticalCount }}</div>
              <div class="stat-label">Critiques</div>
            </div>
          </div>
          <div class="stat-item high" @click="setSeverityFilter('high')">
            <div class="stat-icon">
              <AlertTriangle :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ vulnStore.highCount }}</div>
              <div class="stat-label">Élevées</div>
            </div>
          </div>
          <div class="stat-item medium" @click="setSeverityFilter('medium')">
            <div class="stat-icon">
              <AlertCircle :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ vulnStore.mediumCount }}</div>
              <div class="stat-label">Moyennes</div>
            </div>
          </div>
          <div class="stat-item low" @click="setSeverityFilter('low')">
            <div class="stat-icon">
              <Info :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ vulnStore.lowCount }}</div>
              <div class="stat-label">Faibles</div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-section">
          <div class="filters-row">
            <select v-model="vulnStore.filters.severity" class="filter-select">
              <option :value="null">Toutes les sévérités</option>
              <option value="critical">Critique</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>

            <select v-model="vulnStore.filters.status" class="filter-select">
              <option :value="null">Tous les statuts</option>
              <option value="open">Ouvertes</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolues</option>
            </select>

            <div class="search-box">
              <Search :size="18" />
              <input v-model="searchQuery" type="text" placeholder="Rechercher CVE, titre..." />
            </div>

            <button
                v-if="vulnStore.filters.severity || vulnStore.filters.status || searchQuery"
                @click="clearAllFilters"
                class="btn-clear"
            >
              <X :size="18" />
              Effacer
            </button>
          </div>

          <div class="active-filters" v-if="hasActiveFilters">
            <span class="filter-label">Filtres actifs:</span>
            <span v-if="vulnStore.filters.severity" class="filter-chip">
              Sévérité: {{ vulnStore.filters.severity }}
              <button @click="vulnStore.filters.severity = null">
                <X :size="14" />
              </button>
            </span>
            <span v-if="vulnStore.filters.status" class="filter-chip">
              Statut: {{ getStatusLabel(vulnStore.filters.status) }}
              <button @click="vulnStore.filters.status = null">
                <X :size="14" />
              </button>
            </span>
            <span v-if="searchQuery" class="filter-chip">
              Recherche: "{{ searchQuery }}"
              <button @click="searchQuery = ''">
                <X :size="14" />
              </button>
            </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="vulnStore.loading" class="loading-container">
          <div class="spinner-large"></div>
          <p>Chargement des vulnérabilités...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredVulnerabilities.length === 0" class="empty-state">
          <Bug :size="64" />
          <h3>Aucune vulnérabilité trouvée</h3>
          <p v-if="hasActiveFilters">Essayez de modifier vos filtres</p>
          <p v-else>Aucune vulnérabilité n'a été détectée pour le moment</p>
        </div>

        <!-- Vulnerabilities List -->
        <VulnerabilityList
            v-else
            :vulnerabilities="filteredVulnerabilities"
        />

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="pagination-btn"
          >
            <ChevronLeft :size="18" />
            Précédent
          </button>

          <div class="pagination-pages">
            <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                class="pagination-btn"
                :class="{ active: page === currentPage }"
            >
              {{ page }}
            </button>
          </div>

          <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="pagination-btn"
          >
            Suivant
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVulnerabilitiesStore } from '../stores/vulnerabilities'
import {
  Bug,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  Download,
  RefreshCw,
  Search,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import Sidebar from '../components/layout/Sidebar.vue'
import Navbar from '../components/layout/Navbar.vue'
import VulnerabilityList from '../components/vulnerabilities/VulnerabilityList.vue'

const vulnStore = useVulnerabilitiesStore()

const searchQuery = ref('')
const currentPage = ref(1)
const perPage = 10

const filteredVulnerabilities = computed(() => {
  let vulns = vulnStore.filteredVulnerabilities

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    vulns = vulns.filter(v =>
        v.cve.toLowerCase().includes(query) ||
        v.title.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query)
    )
  }

  return vulns
})

const paginatedVulnerabilities = computed(() => {
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return filteredVulnerabilities.value.slice(start, end)
})

const totalPages = computed(() =>
    Math.ceil(filteredVulnerabilities.value.length / perPage)
)

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const hasActiveFilters = computed(() =>
    vulnStore.filters.severity || vulnStore.filters.status || searchQuery.value
)

const setSeverityFilter = (severity) => {
  vulnStore.setFilter('severity', severity === vulnStore.filters.severity ? null : severity)
}

const getStatusLabel = (status) => {
  const labels = {
    open: 'Ouvertes',
    in_progress: 'En cours',
    resolved: 'Résolues'
  }
  return labels[status] || status
}

const clearAllFilters = () => {
  vulnStore.clearFilters()
  searchQuery.value = ''
  currentPage.value = 1
}

const goToPage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const refreshData = () => {
  vulnStore.fetchVulnerabilities()
}

const exportVulnerabilities = () => {
  alert('Export des vulnérabilités en cours...')
}

onMounted(() => {
  vulnStore.fetchVulnerabilities()
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

.vulnerabilities-page {
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

.vuln-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border-left: 4px solid;
  transition: all 0.2s;
  cursor: pointer;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item.critical {
  border-color: #ef4444;
}

.stat-item.high {
  border-color: #f59e0b;
}

.stat-item.medium {
  border-color: #3b82f6;
}

.stat-item.low {
  border-color: #10b981;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.critical .stat-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.high .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.medium .stat-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.low .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-row {
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

.btn-clear {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.btn-clear:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.active-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.filter-chip button {
  display: flex;
  align-items: center;
  padding: 2px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.filter-chip button:hover {
  opacity: 1;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 40px;
  height: 40px;
  padding: 0 16px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.pagination-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .vulnerabilities-page {
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

  .vuln-stats {
    grid-template-columns: 1fr;
  }

  .filters-row {
    flex-direction: column;
  }

  .filter-select,
  .search-box {
    width: 100%;
    max-width: none;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>