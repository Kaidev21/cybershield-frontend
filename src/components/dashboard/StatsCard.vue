<template>
  <div class="stats-card" :class="`stats-card-${color}`">
    <div class="card-icon">
      <component :is="iconComponent" :size="24" />
    </div>
    <div class="card-content">
      <div class="card-value">{{ value }}</div>
      <div class="card-title">{{ title }}</div>
      <div v-if="trend" class="card-trend" :class="trend > 0 ? 'trend-up' : 'trend-down'">
        <component :is="trend > 0 ? TrendingUp : TrendingDown" :size="14" />
        <span>{{ Math.abs(trend) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ScanSearch, Bell, Bug, Heart, TrendingUp, TrendingDown } from 'lucide-vue-next'

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: String,
  trend: Number
})

const iconComponent = computed(() => {
  const icons = {
    scan: ScanSearch,
    alert: Bell,
    bug: Bug,
    heart: Heart
  }
  return icons[props.icon] || ScanSearch
})
</script>

<style scoped>
.stats-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-card-blue .card-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.stats-card-orange .card-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.stats-card-red .card-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.stats-card-green .card-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.card-title {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.card-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.trend-up {
  background: #d1fae5;
  color: #065f46;
}

.trend-down {
  background: #fee2e2;
  color: #991b1b;
}
</style>