<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Nouveau Scan de Sécurité</h2>
        <button @click="$emit('close')" class="btn-close">
          <X :size="20" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label>Nom du scan</label>
          <input
              v-model="scanConfig.name"
              type="text"
              placeholder="Ex: Scan réseau production"
              required
          />
        </div>

        <div class="form-group">
          <label>Type de scan</label>
          <select v-model="scanConfig.type" required>
            <option value="network">Scan réseau (Nmap)</option>
            <option value="application">Scan applicatif (Nuclei)</option>
            <option value="full">Scan complet</option>
          </select>
        </div>

        <div class="form-group">
          <label>Cible</label>
          <input
              v-model="scanConfig.target"
              type="text"
              :placeholder="getTargetPlaceholder()"
              required
          />
          <span class="help-text">{{ getTargetHelp() }}</span>
        </div>

        <div v-if="scanConfig.type === 'network'" class="form-group">
          <label>Options Nmap</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input v-model="scanConfig.quickScan" type="checkbox" />
              <span>Scan rapide (-F)</span>
            </label>
            <label class="checkbox-label">
              <input v-model="scanConfig.serviceDetection" type="checkbox" />
              <span>Détection de services (-sV)</span>
            </label>
            <label class="checkbox-label">
              <input v-model="scanConfig.osDetection" type="checkbox" />
              <span>Détection OS (-O)</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Priorité</label>
          <select v-model="scanConfig.priority">
            <option value="low">Basse</option>
            <option value="normal">Normale</option>
            <option value="high">Haute</option>
          </select>
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Annuler
          </button>
          <button type="submit" class="btn btn-primary">
            <Play :size="18" />
            Lancer le scan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, Play } from 'lucide-vue-next'

const emit = defineEmits(['close', 'start'])

const scanConfig = ref({
  name: '',
  type: 'network',
  target: '',
  priority: 'normal',
  quickScan: false,
  serviceDetection: true,
  osDetection: false
})

const getTargetPlaceholder = () => {
  if (scanConfig.value.type === 'network') {
    return 'Ex: 192.168.1.0/24 ou 10.0.0.1'
  }
  return 'Ex: https://example.com'
}

const getTargetHelp = () => {
  if (scanConfig.value.type === 'network') {
    return 'Adresse IP, plage CIDR ou nom d\'hôte'
  }
  return 'URL complète de l\'application web'
}

const handleSubmit = () => {
  emit('start', { ...scanConfig.value })
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
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
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
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 24px;
  color: #1e293b;
  margin: 0;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.help-text {
  font-size: 12px;
  color: #94a3b8;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-footer {
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

.btn-secondary {
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f1f5f9;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}
</style>