<template>
  <div class="page-container">
    <Sidebar />
    <div class="main-content">
      <Navbar />

      <div class="scans-page">
        <!-- Page Header -->
        <div class="page-header">
          <div>
            <h1>Scans de Sécurité</h1>
            <p>Gérez et visualisez vos analyses de sécurité</p>
          </div>
          <button @click="showStartScanModal = true" class="btn btn-primary">
            <Plus :size="20" />
            Nouveau Scan
          </button>
        </div>

        <!-- Statistics Summary -->
        <div class="stats-summary">
          <div class="stat-card blue">
            <div class="stat-icon">
              <Activity :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ scansStore.runningScans.length }}</div>
              <div class="stat-label">En cours</div>
            </div>
          </div>

          <div class="stat-card green">
            <div class="stat-icon">
              <CheckCircle :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ scansStore.completedScans.length }}</div>
              <div class="stat-label">Terminés</div>
            </div>
          </div>

          <div class="stat-card purple">
            <div class="stat-icon">
              <Target :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ scansStore.scans.length }}</div>
              <div class="stat-label">Total</div>
            </div>
          </div>

          <div class="stat-card orange">
            <div class="stat-icon">
              <AlertTriangle :size="24" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalVulnerabilities }}</div>
              <div class="stat-label">Vulnérabilités</div>
            </div>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="filter-tabs">
            <button
                @click="activeFilter = 'all'"
                class="filter-tab"
                :class="{ active: activeFilter === 'all' }"
            >
              <Globe :size="18" />
              Tous ({{ scansStore.scans.length }})
            </button>
            <button
                @click="activeFilter = 'running'"
                class="filter-tab"
                :class="{ active: activeFilter === 'running' }"
            >
              <Activity :size="18" />
              En cours ({{ scansStore.runningScans.length }})
            </button>
            <button
                @click="activeFilter = 'completed'"
                class="filter-tab"
                :class="{ active: activeFilter === 'completed' }"
            >
              <CheckCircle :size="18" />
              Terminés ({{ scansStore.completedScans.length }})
            </button>
          </div>

          <div class="filter-controls">
            <select v-model="filterType" class="filter-select">
              <option value="all">Tous les types</option>
              <option value="network">Réseau (Nmap)</option>
              <option value="application">Application (Nuclei)</option>
              <option value="full">Scan complet</option>
            </select>

            <div class="search-box">
              <Search :size="18" />
              <input v-model="searchQuery" type="text" placeholder="Rechercher un scan..." />
            </div>

            <div class="view-toggle">
              <button
                  @click="viewMode = 'grid'"
                  class="toggle-btn"
                  :class="{ active: viewMode === 'grid' }"
                  title="Vue grille"
              >
                <Grid3x3 :size="18" />
              </button>
              <button
                  @click="viewMode = 'list'"
                  class="toggle-btn"
                  :class="{ active: viewMode === 'list' }"
                  title="Vue liste"
              >
                <List :size="18" />
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="scansStore.loading" class="loading-state">
          <div class="spinner-large"></div>
          <p>Chargement des scans...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredScans.length === 0" class="empty-state">
          <ScanSearch :size="64" />
          <h3>{{ getEmptyTitle }}</h3>
          <p>{{ getEmptyMessage }}</p>
          <button v-if="activeFilter === 'all'" @click="showStartScanModal = true" class="btn btn-primary">
            <Plus :size="20" />
            Lancer votre premier scan
          </button>
        </div>

        <!-- Scans Content -->
        <div v-else>
          <!-- Active Scans Section (if any running) -->
          <div v-if="scansStore.runningScans.length > 0 && activeFilter !== 'completed'" class="section">
            <div class="section-header">
              <h2>
                <Activity :size="20" />
                Scans en Cours
                <span class="count-badge">{{ scansStore.runningScans.length }}</span>
              </h2>
            </div>
            <div :class="viewMode === 'grid' ? 'scans-grid' : 'scans-list'">
              <ScanCard
                  v-for="scan in scansStore.runningScans"
                  :key="scan.id"
                  :scan="scan"
                  :view-mode="viewMode"
                  @stop="handleStopScan"
              />
            </div>
          </div>

          <!-- All/Completed Scans Section -->
          <div class="section">
            <div class="section-header">
              <h2>
                <History :size="20" />
                {{ activeFilter === 'completed' ? 'Scans Terminés' : 'Tous les Scans' }}
                <span class="count-badge">{{ filteredScans.length }}</span>
              </h2>
              <div class="section-actions">
                <button @click="refreshScans" class="btn-icon" title="Actualiser">
                  <RefreshCw :size="18" :class="{ spinning: scansStore.loading }" />
                </button>
                <button @click="exportScans" class="btn-secondary">
                  <Download :size="18" />
                  Exporter
                </button>
              </div>
            </div>

            <div :class="viewMode === 'grid' ? 'scans-grid' : 'scans-list'">
              <ScanCard
                  v-for="scan in paginatedScans"
                  :key="scan.id"
                  :scan="scan"
                  :view-mode="viewMode"
                  @view="viewScanDetails"
                  @delete="handleDeleteScan"
              />
            </div>

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

        <!-- Start Scan Modal -->
        <StartScanModal
            v-if="showStartScanModal"
            @close="showStartScanModal = false"
            @start="handleStartScan"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScansStore } from '../stores/scans'
import {
  Plus,
  Search,
  Activity,
  History,
  Grid3x3,
  List,
  ScanSearch,
  Globe,
  CheckCircle,
  Target,
  AlertTriangle,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import Sidebar from '../components/layout/Sidebar.vue'
import Navbar from '../components/layout/Navbar.vue'
import ScanCard from '../components/scans/ScanCard.vue'
import StartScanModal from '../components/scans/StartScanModal.vue'

const scansStore = useScansStore()

// State
const showStartScanModal = ref(false)
const activeFilter = ref('all')
const filterType = ref('all')
const searchQuery = ref('')
const viewMode = ref('grid')
const currentPage = ref(1)
const perPage = 9

// Computed
const totalVulnerabilities = computed(() => {
  return scansStore.scans.reduce((total, scan) => {
    return total + (scan.vulnerabilities || 0)
  }, 0)
})

const filteredScans = computed(() => {
  let scans = []

  // Filter by status
  if (activeFilter.value === 'all') {
    scans = scansStore.scans
  } else if (activeFilter.value === 'running') {
    scans = scansStore.runningScans
  } else if (activeFilter.value === 'completed') {
    scans = scansStore.completedScans
  }

  // Filter by type
  if (filterType.value !== 'all') {
    scans = scans.filter(s => s.type === filterType.value)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    scans = scans.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.target.toLowerCase().includes(query)
    )
  }

  return scans
})

const paginatedScans = computed(() => {
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return filteredScans.value.slice(start, end)
})

const totalPages = computed(() =>
    Math.ceil(filteredScans.value.length / perPage)
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

const getEmptyTitle = computed(() => {
  if (activeFilter.value === 'running') return 'Aucun scan en cours'
  if (activeFilter.value === 'completed') return 'Aucun scan terminé'
  if (searchQuery.value) return 'Aucun résultat'
  return 'Aucun scan disponible'
})

const getEmptyMessage = computed(() => {
  if (activeFilter.value === 'running') return 'Lancez un nouveau scan pour commencer'
  if (activeFilter.value === 'completed') return 'Aucun scan n\'a été complété pour le moment'
  if (searchQuery.value) return 'Essayez avec d\'autres mots-clés'
  return 'Commencez par lancer votre premier scan de sécurité'
})

// Methods
const handleStartScan = async (scanConfig) => {
  const result = await scansStore.startScan(scanConfig)
  if (result.success) {
    showStartScanModal.value = false
    activeFilter.value = 'running'
  }
}

const handleStopScan = async (scanId) => {
  if (confirm('Êtes-vous sûr de vouloir arrêter ce scan ?')) {
    await scansStore.stopScan(scanId)
  }
}

const viewScanDetails = (scan) => {
  // Implémenter la navigation vers les détails
  console.log('View scan details:', scan)
}

const handleDeleteScan = async (scanId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce scan ?')) {
    // Implémenter la suppression
    console.log('Delete scan:', scanId)
  }
}

const refreshScans = () => {
  scansStore.fetchScans()
}

const exportScans = () => {
  alert('Export des scans en cours...')
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

// Lifecycle
onMounted(() => {
  scansStore.fetchScans()
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

.scans-page {
  padding: 32px;
}

/* Page Header */
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

/* Buttons */
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
  padding: 10px 20px;
}

.btn-secondary:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  border-color: #667eea;
  color: #667eea;
}

/* Statistics Summary */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
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

.stat-card.blue .stat-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-card.green .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card.purple .stat-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-card.orange .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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

/* Filter Bar */
.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
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
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  min-width: 200px;
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

.view-toggle {
  display: flex;
  gap: 4px;
  background: #f8fafc;
  padding: 4px;
  border-radius: 8px;
}

.toggle-btn {
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background: #e2e8f0;
}

.toggle-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Loading State */
.loading-state {
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Empty State */
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

.empty-state p {
  margin-bottom: 24px;
}

/* Section */
.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  color: #1e293b;
}

.count-badge {
  padding: 4px 12px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.section-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Scans Grid */
.scans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.scans-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Pagination */
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

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .scans-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-bar {
    padding: 16px;
  }

  .filter-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .search-box {
    width: 100%;
    max-width: none;
  }

  .scans-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>