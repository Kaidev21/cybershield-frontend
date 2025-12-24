<template>
  <div class="page-container">
    <Sidebar />
    <div class="main-content">
      <Navbar />

      <div class="settings-page">
        <div class="page-header">
          <div>
            <h1>Paramètres</h1>
            <p>Configurez votre plateforme CyberShield</p>
          </div>
        </div>

        <!-- Settings Tabs -->
        <div class="settings-tabs">
          <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
          >
            <component :is="tab.icon" :size="20" />
            {{ tab.label }}
          </button>
        </div>

        <!-- General Settings -->
        <div v-if="activeTab === 'general'" class="settings-section">
          <div class="card">
            <div class="card-header">
              <h3>
                <Settings2 :size="20" />
                Paramètres Généraux
              </h3>
              <span class="badge-info">Configuration de base</span>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Nom du site</label>
                <input v-model="settingsStore.general.siteName" type="text" class="form-control" />
                <span class="help-text">Le nom affiché dans l'application</span>
              </div>

              <div class="form-group">
                <label>Langue</label>
                <select v-model="settingsStore.general.language" class="form-control">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div class="form-group">
                <label>Fuseau horaire</label>
                <select v-model="settingsStore.general.timezone" class="form-control">
                  <option value="Africa/Douala">Afrique/Douala (GMT+1)</option>
                  <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                  <option value="America/New_York">America/New_York (GMT-5)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                </select>
              </div>
            </div>

            <div class="setting-toggle">
              <div class="toggle-info">
                <Moon :size="20" />
                <div>
                  <div class="toggle-label">Mode Sombre</div>
                  <div class="toggle-description">Activer le thème sombre de l'interface</div>
                </div>
              </div>
              <label class="toggle">
                <input v-model="darkMode" type="checkbox" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <button @click="saveSettings('general')" class="btn btn-primary">
              <Save :size="18" />
              Enregistrer
            </button>
          </div>
        </div>

        <!-- Security Settings -->
        <div v-if="activeTab === 'security'" class="settings-section">
          <div class="card">
            <div class="card-header">
              <h3>
                <Shield :size="20" />
                Paramètres de Sécurité
              </h3>
              <span class="badge-warning">Sensible</span>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Délai d'expiration de session (minutes)</label>
                <input
                    v-model.number="settingsStore.security.sessionTimeout"
                    type="number"
                    min="5"
                    max="120"
                    class="form-control"
                />
                <span class="help-text">Entre 5 et 120 minutes</span>
              </div>

              <div class="form-group">
                <label>Expiration du mot de passe (jours)</label>
                <input
                    v-model.number="settingsStore.security.passwordExpiry"
                    type="number"
                    min="30"
                    max="365"
                    class="form-control"
                />
                <span class="help-text">Fréquence de changement obligatoire</span>
              </div>
            </div>

            <div class="security-options">
              <div class="setting-toggle">
                <div class="toggle-info">
                  <Lock :size="20" />
                  <div>
                    <div class="toggle-label">Authentification à deux facteurs (2FA)</div>
                    <div class="toggle-description">Ajouter une couche de sécurité supplémentaire avec un code OTP</div>
                  </div>
                </div>
                <label class="toggle">
                  <input v-model="settingsStore.security.twoFactorAuth" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="setting-toggle">
                <div class="toggle-info">
                  <Key :size="20" />
                  <div>
                    <div class="toggle-label">Politique de mot de passe fort</div>
                    <div class="toggle-description">Exiger majuscules, chiffres et caractères spéciaux</div>
                  </div>
                </div>
                <label class="toggle">
                  <input v-model="strongPassword" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="setting-toggle">
                <div class="toggle-info">
                  <UserCheck :size="20" />
                  <div>
                    <div class="toggle-label">Journalisation des connexions</div>
                    <div class="toggle-description">Enregistrer tous les événements de connexion</div>
                  </div>
                </div>
                <label class="toggle">
                  <input v-model="loginLogging" type="checkbox" checked disabled />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="info-box">
              <AlertCircle :size="20" />
              <div>
                <strong>Note de sécurité:</strong> La modification de ces paramètres peut affecter tous les utilisateurs de la plateforme. Assurez-vous de communiquer les changements à votre équipe.
              </div>
            </div>

            <button @click="saveSettings('security')" class="btn btn-primary">
              <Save :size="18" />
              Enregistrer
            </button>
          </div>
        </div>

        <!-- Notifications Settings -->
        <div v-if="activeTab === 'notifications'" class="settings-section">
          <div class="card">
            <div class="card-header">
              <h3>
                <Bell :size="20" />
                Préférences de Notification
              </h3>
            </div>

            <div class="notifications-list">
              <div class="notification-item">
                <div class="notification-info">
                  <Mail :size="20" />
                  <div>
                    <div class="notification-label">Notifications Email</div>
                    <div class="notification-description">Recevoir les alertes et rapports par email</div>
                  </div>
                </div>
                <label class="toggle">
                  <input v-model="settingsStore.notifications.email" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <MessageSquare :size="20" />
                  <div>
                    <div class="notification-label">Notifications SMS</div>
                    <div class="notification-description">Recevoir les alertes critiques par SMS</div>
                  </div>
                </div>
                <label class="toggle">
                  <input v-model="settingsStore.notifications.sms" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <Globe :size="20" />
                  <div>
                    <div class="notification-label">Notifications Navigateur</div>
                    <div class="notification-description">Afficher les notifications dans le navigateur</div>
                  </div>
                </div>
                <label class="toggle">
                  <input v-model="settingsStore.notifications.browser" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="notification-frequency">
              <h4>Fréquence des Notifications</h4>
              <div class="frequency-options">
                <label class="radio-option">
                  <input type="radio" name="frequency" value="instant" v-model="notificationFrequency" />
                  <div>
                    <div class="radio-label">Instantané</div>
                    <div class="radio-desc">Recevoir immédiatement chaque alerte</div>
                  </div>
                </label>

                <label class="radio-option">
                  <input type="radio" name="frequency" value="hourly" v-model="notificationFrequency" />
                  <div>
                    <div class="radio-label">Résumé horaire</div>
                    <div class="radio-desc">Un résumé toutes les heures</div>
                  </div>
                </label>

                <label class="radio-option">
                  <input type="radio" name="frequency" value="daily" v-model="notificationFrequency" />
                  <div>
                    <div class="radio-label">Résumé quotidien</div>
                    <div class="radio-desc">Un rapport journalier à 9h00</div>
                  </div>
                </label>
              </div>
            </div>

            <button @click="saveSettings('notifications')" class="btn btn-primary">
              <Save :size="18" />
              Enregistrer
            </button>
          </div>
        </div>

        <!-- Scanning Settings -->
        <div v-if="activeTab === 'scanning'" class="settings-section">
          <div class="card">
            <div class="card-header">
              <h3>
                <ScanSearch :size="20" />
                Configuration des Scans
              </h3>
            </div>

            <div class="setting-toggle mb-4">
              <div class="toggle-info">
                <Clock :size="20" />
                <div>
                  <div class="toggle-label">Scans Automatiques</div>
                  <div class="toggle-description">Exécuter des scans selon un planning prédéfini</div>
                </div>
              </div>
              <label class="toggle">
                <input v-model="settingsStore.scanning.autoScan" type="checkbox" />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div v-if="settingsStore.scanning.autoScan" class="auto-scan-config">
              <div class="form-grid">
                <div class="form-group">
                  <label>Fréquence des scans</label>
                  <select v-model="settingsStore.scanning.scanFrequency" class="form-control">
                    <option value="daily">Quotidien</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuel</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Heure d'exécution</label>
                  <input type="time" v-model="scanTime" class="form-control" />
                </div>

                <div class="form-group">
                  <label>Nombre maximum de scans simultanés</label>
                  <input
                      v-model.number="settingsStore.scanning.maxConcurrentScans"
                      type="number"
                      min="1"
                      max="10"
                      class="form-control"
                  />
                </div>
              </div>

              <div class="scan-types">
                <h4>Types de scans automatiques</h4>
                <div class="scan-type-list">
                  <label class="checkbox-option">
                    <input type="checkbox" v-model="autoScanTypes.network" />
                    <div>
                      <div class="option-label">Scan Réseau (Nmap)</div>
                      <div class="option-desc">Analyse des ports et services</div>
                    </div>
                  </label>

                  <label class="checkbox-option">
                    <input type="checkbox" v-model="autoScanTypes.application" />
                    <div>
                      <div class="option-label">Scan Applicatif (Nuclei)</div>
                      <div class="option-desc">Recherche de vulnérabilités web</div>
                    </div>
                  </label>

                  <label class="checkbox-option">
                    <input type="checkbox" v-model="autoScanTypes.compliance" />
                    <div>
                      <div class="option-label">Audit de Conformité</div>
                      <div class="option-desc">Vérification des standards de sécurité</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div class="scan-retention">
              <h4>Rétention des Résultats</h4>
              <div class="form-group">
                <label>Durée de conservation des scans (jours)</label>
                <input type="number" v-model.number="scanRetention" min="7" max="365" class="form-control" />
                <span class="help-text">Les scans plus anciens seront automatiquement supprimés</span>
              </div>
            </div>

            <button @click="saveSettings('scanning')" class="btn btn-primary">
              <Save :size="18" />
              Enregistrer
            </button>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div v-if="activeTab === 'advanced'" class="settings-section">
          <div class="card">
            <div class="card-header">
              <h3>
                <Sliders :size="20" />
                Paramètres Avancés
              </h3>
              <span class="badge-danger">Pour utilisateurs experts</span>
            </div>

            <div class="advanced-options">
              <div class="option-group">
                <h4>Performance</h4>
                <div class="form-group">
                  <label>Limite de requêtes API (par minute)</label>
                  <input type="number" v-model.number="apiRateLimit" min="10" max="1000" class="form-control" />
                </div>

                <div class="form-group">
                  <label>Timeout des requêtes (secondes)</label>
                  <input type="number" v-model.number="requestTimeout" min="5" max="60" class="form-control" />
                </div>
              </div>

              <div class="option-group">
                <h4>Intégrations</h4>
                <div class="integration-list">
                  <div class="integration-item">
                    <div class="integration-info">
                      <div class="integration-icon">
                        <Database :size="20" />
                      </div>
                      <div>
                        <div class="integration-name">API CVE/NVD</div>
                        <div class="integration-status connected">Connecté</div>
                      </div>
                    </div>
                    <button class="btn-configure">Configurer</button>
                  </div>

                  <div class="integration-item">
                    <div class="integration-info">
                      <div class="integration-icon">
                        <Webhook :size="20" />
                      </div>
                      <div>
                        <div class="integration-name">Webhooks</div>
                        <div class="integration-status">Non configuré</div>
                      </div>
                    </div>
                    <button class="btn-configure">Configurer</button>
                  </div>
                </div>
              </div>

              <div class="option-group">
                <h4>Maintenance</h4>
                <div class="maintenance-actions">
                  <button @click="clearCache" class="btn btn-secondary">
                    <Trash2 :size="18" />
                    Vider le cache
                  </button>

                  <button @click="exportSettings" class="btn btn-secondary">
                    <Download :size="18" />
                    Exporter les paramètres
                  </button>

                  <button @click="resetSettings" class="btn btn-danger">
                    <RotateCcw :size="18" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings'
import {
  Settings2,
  Shield,
  Bell,
  ScanSearch,
  Sliders,
  Moon,
  Lock,
  Key,
  UserCheck,
  Mail,
  MessageSquare,
  Globe,
  Clock,
  Save,
  AlertCircle,
  Database,
  Webhook,
  Trash2,
  Download,
  RotateCcw
} from 'lucide-vue-next'
import Sidebar from '../components/layout/Sidebar.vue'
import Navbar from '../components/layout/Navbar.vue'

const settingsStore = useSettingsStore()

const activeTab = ref('general')
const darkMode = ref(false)
const strongPassword = ref(true)
const loginLogging = ref(true)
const notificationFrequency = ref('instant')
const scanTime = ref('02:00')
const autoScanTypes = ref({
  network: true,
  application: true,
  compliance: false
})
const scanRetention = ref(90)
const apiRateLimit = ref(100)
const requestTimeout = ref(30)

const tabs = [
  { id: 'general', label: 'Général', icon: Settings2 },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'scanning', label: 'Scans', icon: ScanSearch },
  { id: 'advanced', label: 'Avancé', icon: Sliders }
]

const saveSettings = async (category) => {
  await settingsStore.updateSettings(category, settingsStore[category])
  alert(`Paramètres ${category} enregistrés avec succès !`)
}

const clearCache = () => {
  if (confirm('Êtes-vous sûr de vouloir vider le cache ?')) {
    alert('Cache vidé avec succès !')
  }
}

const exportSettings = () => {
  alert('Export des paramètres en cours...')
}

const resetSettings = () => {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ? Cette action est irréversible.')) {
    alert('Paramètres réinitialisés !')
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

.settings-page {
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

.settings-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  overflow-x: auto;
  flex-wrap: wrap;
}

.tab-btn {
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
  white-space: nowrap;
}

.tab-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.settings-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
}

.integration-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.integration-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.integration-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.integration-status {
  font-size: 12px;
  color: #64748b;
}

.integration-status.connected {
  color: #10b981;
  font-weight: 600;
}

.btn-configure {
  padding: 8px 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-configure:hover {
  border-color: #667eea;
  color: #667eea;
}

.maintenance-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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

.btn-danger {
  background: white;
  color: #ef4444;
  border: 2px solid #ef4444;
}

.btn-danger:hover {
  background: #ef4444;
  color: white;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .settings-page {
    padding: 16px;
  }

  .settings-tabs {
    overflow-x: scroll;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .frequency-options {
    grid-template-columns: 1fr;
  }

  .setting-toggle,
  .notification-item,
  .integration-item {
    flex-direction: column;
    gap: 16px;
  }

  .maintenance-actions {
    flex-direction: column;
  }

  .maintenance-actions .btn {
    width: 100%;
  }
}
</style>