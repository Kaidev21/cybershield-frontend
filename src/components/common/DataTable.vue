<template>
  <div class="data-table">
    <div v-if="searchable" class="table-header">
      <div class="search-box">
        <Search :size="18" />
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher..."
            @input="handleSearch"
        />
      </div>
      <div class="table-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
        <tr>
          <th
              v-for="column in columns"
              :key="column.key"
              :class="{ sortable: column.sortable }"
              @click="column.sortable && sort(column.key)"
          >
            <div class="th-content">
              <span>{{ column.label }}</span>
              <span v-if="column.sortable && sortKey === column.key" class="sort-icon">
                  <component :is="sortOrder === 'asc' ? ChevronUp : ChevronDown" :size="16" />
                </span>
            </div>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="loading-cell">
            <div class="spinner"></div>
            <span>Chargement...</span>
          </td>
        </tr>
        <tr v-else-if="paginatedData.length === 0">
          <td :colspan="columns.length" class="empty-cell">
            Aucune donnée disponible
          </td>
        </tr>
        <tr
            v-else
            v-for="(row, index) in paginatedData"
            :key="row.id || index"
            @click="$emit('row-click', row)"
            :class="{ clickable: $attrs['onRow-click'] }"
        >
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ formatCell(row[column.key], column) }}
            </slot>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div v-if="paginate" class="table-footer">
      <div class="rows-info">
        Affichage de {{ startRow }} à {{ endRow }} sur {{ filteredData.length }} résultats
      </div>
      <div class="pagination">
        <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="pagination-btn"
        >
          <ChevronLeft :size="18" />
        </button>

        <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            class="pagination-btn"
            :class="{ active: page === currentPage }"
        >
          {{ page }}
        </button>

        <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
        >
          <ChevronRight :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    // Format: [{ key: 'name', label: 'Nom', sortable: true, format: 'date' }]
  },
  data: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  searchable: {
    type: Boolean,
    default: true
  },
  paginate: {
    type: Boolean,
    default: true
  },
  perPage: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['row-click', 'search'])

const searchQuery = ref('')
const sortKey = ref('')
const sortOrder = ref('asc')
const currentPage = ref(1)

const filteredData = computed(() => {
  let result = [...props.data]

  // Recherche
  if (searchQuery.value) {
    result = result.filter(row =>
        Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    )
  }

  // Tri
  if (sortKey.value) {
    result.sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]

      if (aVal === bVal) return 0

      const comparison = aVal > bVal ? 1 : -1
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  }

  return result
})

const totalPages = computed(() =>
    Math.ceil(filteredData.value.length / props.perPage)
)

const paginatedData = computed(() => {
  if (!props.paginate) return filteredData.value

  const start = (currentPage.value - 1) * props.perPage
  const end = start + props.perPage
  return filteredData.value.slice(start, end)
})

const startRow = computed(() =>
    filteredData.value.length === 0 ? 0 : (currentPage.value - 1) * props.perPage + 1
)

const endRow = computed(() =>
    Math.min(currentPage.value * props.perPage, filteredData.value.length)
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

const sort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const handleSearch = () => {
  currentPage.value = 1
  emit('search', searchQuery.value)
}

const goToPage = (page) => {
  currentPage.value = page
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const formatCell = (value, column) => {
  if (!value) return '-'

  if (column.format === 'date') {
    return new Date(value).toLocaleDateString('fr-FR')
  }

  if (column.format === 'datetime') {
    return new Date(value).toLocaleString('fr-FR')
  }

  return value
}

watch(() => props.data, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  gap: 16px;
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

.table-actions {
  display: flex;
  gap: 12px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8fafc;
}

th {
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #64748b;
  text-transform: uppercase;
  white-space: nowrap;
}

th.sortable {
  cursor: pointer;
  user-select: none;
}

th.sortable:hover {
  color: #667eea;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-icon {
  display: flex;
  color: #667eea;
}

tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

tbody tr.clickable {
  cursor: pointer;
}

tbody tr:hover {
  background: #f8fafc;
}

td {
  padding: 16px 20px;
  color: #475569;
  font-size: 14px;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.loading-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  border: 3px solid #f3f4f6;
  border-top-color: #667eea;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
}

.rows-info {
  font-size: 14px;
  color: #64748b;
}

.pagination {
  display: flex;
  gap: 4px;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
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
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .table-footer {
    flex-direction: column;
    gap: 16px;
  }

  th, td {
    padding: 12px 16px;
    font-size: 13px;
  }
}
</style>