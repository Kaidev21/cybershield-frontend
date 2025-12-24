<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Paramètres des Alertes</h2>
        <button @click="$emit('close')" class="btn-close">
          <X :size="20" />
        </button>
      </div>

      <div class="modal-body">
        <div class="settings-section">
          <h3>Notifications Email</h3>
          <div class="setting-item">
            <div class="setting-info">
              <Mail :size="20" />
              <div>
                <div class="setting-label">Activer les emails</div>
                <div class="setting-description">Recevoir les alertes par email</div>
              </div>
            </div>
            <label class="toggle">
              <input v-model="settings.emailEnabled" type="checkbox" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div v-if="settings.emailEnabled" class="form-group">
            <label>Adresse email</label>
            <input v-model="settings.emailAddress" type="email" />
          </div>
        </div>

        <div class="settings-section">
          <h3>Notifications SMS</h3>
          <div class="setting-item">
            <div class="setting-info">
              <Phone :size="20" />
              <div>
                <div class="setting-label">Activer les SMS</div>
                <div class="setting-description">Recevoir les alertes critiques par SMS</div>
              </div>
            </div>
            <label class="toggle">
              <input v-model="settings.smsEnabled" type="checkbox" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div v-if="settings.smsEnabled" class="form-group">
            <label>Numéro de téléphone</label>
            <input v-model="settings.phoneNumber" type="tel" placeholder="+237 XXX XXX XXX" />
          </div>
        </div>

        <div class="settings-section">
          <h3>Niveaux de Sévérité</h3>
          <div class="severity-list">
            <div class="severity-item">
              <input type="checkbox" checked />
              <span class="severity-badge badge-critical">Critique</span>
              <span class="severity-desc">Menaces immédiates nécessitant une action urgente</span>
            </div>
            <div class="severity-item">
              <input type="checkbox" checked />
              <span class="severity-badge badge-high">Élevée</span>
              <span class="severity-desc">Vulnérabilités importantes à traiter rapidement</span>
            </div>
            <div class="severity-item">
              <input type="checkbox" checked />
              <span class="severity-badge badge-medium">Moyenne</span>
              <span class="severity-desc">Problèmes de sécurité à surveiller</span>
            </div>
            <div class="severity-item">
              <input type="checkbox" />
              <span class="severity-badge badge-low">Faible</span>
              <span class="severity-desc">Alertes informatives</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">Annuler</button>
        <button @click="saveSettings" class="btn btn-primary">
          <Save :size="18" />
          Enregistrer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAlertsStore } from '../../stores/alerts'
import { X, Mail, Phone, Save } from 'lucide-vue-next'

const emit = defineEmits(['close'])
const alertsStore = useAlertsStore()

const settings = ref({ ...alertsStore.settings })

const saveSettings = async () => {
  await alertsStore.updateSettings(settings.value)
  emit('close')
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
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section h3 {
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
  margin-bottom: 16px;
}

.setting-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.setting-label {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.setting-description {
  font-size: 13px;
  color: #64748b;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #cbd5e1;
  border-radius: 28px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle input:checked + .toggle-slider {
  background: #667eea;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
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

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
}

.severity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.severity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.severity-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.severity-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  min-width: 80px;
  text-align: center;
}

.severity-desc {
  flex: 1;
  font-size: 13px;
  color: #64748b;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e2e8f0;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>