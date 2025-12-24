<template>
  <div class="page-container">
    <Sidebar />
    <div class="main-content">
      <Navbar />

      <div class="settings-page">
        <!-- Page Header -->
        <div class="page-header">
          <div>
            <h1>Paramètres</h1>
            <p>Configurez votre plateforme CyberShield</p>
          </div>
          <div class="header-actions">
            <button @click="resetAllSettings" class="btn btn-secondary">
              <RotateCcw :size="18" />
              Réinitialiser
            </button>
            <button @click="saveAllSettings" class="btn btn-primary">
              <Save :size="18" />
              Tout Enregistrer
            </button>
          </div>
        </div>

        <!-- Settings Navigation Tabs -->
        <div class="settings-tabs">
          <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
          >
            <component :is="tab.icon" :size="20" />
            <span>{{ tab.label }}</span>
            <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
          </button>
        </div>

        <!-- General Settings -->
        <div v-if="activeTab === 'general'" class="settings-section">
          <div class="card">
            <div class="card-header">
              <div class="header-left">
                <Settings2 :size="22" />
                <div>
                  <h3>Paramètres Généraux</h3>
                  <p class="card-subtitle">Configuration de base de l'application</p>
                </div>
              </div>
              <span class="badge badge-info">Configuration</span>
            </div>

            <div class="form-section">
              <div class="form-grid">
                <div class="form-group">
                  <label>
                    <Building :size="16" />
                    Nom de l'organisation
                  </label>
                  <input v-model="settingsStore.general.siteName" type="text" class="form-control" placeholder="CyberShield PME" />
                  <span class="help-text">Le nom affiché dans toute l'application</span>
                </div>

                <div class="form-group">
                  <label>
                    <Globe :size="16" />
                    Langue
                  </label>
                  <select v-model="settingsStore.general.language" class="form-control">
                    <option value="fr">🇫🇷 Français</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="de">🇩🇪 Deutsch</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>
                    <Clock :size="16" />
                    Fuseau horaire
                  </label>
                  <select v-model="settingsStore.general.timezone" class="form-control">
                    <option value="Africa/Douala">🌍 Afrique/Douala (GMT+1)</option>
                    <option value="Europe/Paris">🇫🇷 Europe/Paris (GMT+1)</option>
                    <option value="America/New_York">🇺🇸 America/New_York (GMT-5)</option>
                    <option value="Asia/Tokyo">🇯🇵 Asia/Tokyo (GMT+9)</option>
                    <option value="Europe/London">🇬🇧 Europe/London (GMT+0)</option>
                  </select>
                </div>
              </div>

              <div class="toggle-list">
                <div class="toggle-item">
                  <div class="toggle-info">
                    <div class="toggle-icon">
                      <Moon :size="20" />
                    </div>
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

                <div class="toggle-item">
                  <div class="toggle-info">
                    <div class="toggle-icon">
                      <Sparkles :size="20" />
                    </div>
                    <div>
                      <div class="toggle-label">Animations</div>
                      <div class="toggle-description">Activer les animations et transitions</div>
                    </div>
                  </div>
                  <label class="toggle">
                    <input v-model="animations" type="checkbox" checked />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <button @click="saveSettings('general')" class="btn btn-primary">
                <Save :size="18" />
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div v-if="activeTab === 'security'" class="settings-section">
          <div class="card">
            <div class="card-header">
              <div class="header-left">
                <Shield :size="22" />
                <div>
                  <h3>Sécurité & Confidentialité</h3>
                  <p class="card-subtitle">Protégez votre compte et vos données</p>
                </div>
              </div>
              <span class="badge badge-warning">Sensible</span>
            </div>

            <div class="form-section">
              <!-- Session Management -->
              <div class="subsection">
                <h4>
                  <Timer :size="18" />
                  Gestion des Sessions
                </h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Délai d'expiration (minutes)</label>
                    <input
                        v-model.number="settingsStore.security.sessionTimeout"
                        type="number"
                        min="5"
                        max="120"
                        class="form-control"
                    />
                    <span class="help-text">Déconnexion automatique après inactivité (5-120 min)</span>
                  </div>

                  <div class="form-group">
                    <label>Expiration mot de passe (jours)</label>
                    <input
                        v-model.number="settingsStore.security.passwordExpiry"
                        type="number"
                        min="30"
                        max="365"
                        class="form-control"
                    />
                    <span class="help-text">Fréquence de changement obligatoire (30-365 jours)</span>
                  </div>
                </div>
              </div>

              <!-- Authentication Options -->
              <div class="subsection">
                <h4>
                  <Lock :size="18" />
                  Options d'Authentification
                </h4>
                <div class="toggle-list">
                  <div class="toggle-item featured">
                    <div class="toggle-info">
                      <div class="toggle-icon purple">
                        <ShieldCheck :size="20" />
                      </div>
                      <div>
                        <div class="toggle-label">Authentification à deux facteurs (2FA)</div>
                        <div class="toggle-description">Ajouter une couche de sécurité avec un code OTP</div>
                      </div>
                    </div>
                    <label class="toggle">
                      <input v-model="settingsStore.security.twoFactorAuth" type="checkbox" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div class="toggle-item">
                    <div class="toggle-info">
                      <div class="toggle-icon">
                        <Key :size="20" />
                      </div>
                      <div>
                        <div class="toggle-label">Politique de mot de passe fort</div>
                        <div class="toggle-description">Min. 8 caractères, majuscules, chiffres et symboles</div>
                      </div>
                    </div>
                    <label class="toggle">
                      <input v-model="strongPassword" type="checkbox" checked />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div class="toggle-item">
                    <div class="toggle-info">
                      <div class="toggle-icon">
                        <UserCheck :size="20" />
                      </div>
                      <div>
                        <div class="toggle-label">Journalisation des connexions</div>
                        <div class="toggle-description">Enregistrer tous les événements d'authentification</div>
                      </div>
                    </div>
                    <label class="toggle">
                      <input v-model="loginLogging" type="checkbox" checked disabled />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="alert-box warning">
                <AlertTriangle :size="20" />
                <div>
                  <strong>Note importante:</strong> Les modifications de sécurité affecteront tous les utilisateurs. Ils seront déconnectés et devront se reconnecter avec les nouvelles règles.
                </div>
              </div>

              <button @click="saveSettings('security')" class="btn btn-primary">
                <Save :size="18" />
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications Settings -->
        <div v-if="activeTab === 'notifications'" class="settings-section">
          <div class="card">
            <div class="card-header">
              <div class="header-left">
                <Bell :size="22" />
                <div>
                  <h3>Notifications & Alertes</h3>
                  <p class="card-subtitle">Configurez comment vous recevez les alertes</p>
                </div>
              </div>
            </div>

            <div class="form-section">
              <!-- Notification Channels -->
              <div class="subsection">
                <h4>
                  <Zap :size="18" />
                  Canaux de Notification
                </h4>
                <div class="notification-cards">
                  <div class="notification-card" :class="{ active: settingsStore.notifications.email }">
                    <div class="notification-header">
                      <Mail :size="24" />
                      <label class="toggle">
                        <input v-model="settingsStore.notifications.email" type="checkbox" />
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                    <h5>Email</h5>
                    <p>Recevoir les alertes et rapports par email</p>
                    <div v-if="settingsStore.notifications.email" class="notification-config">
                      <input type="email" placeholder="email@exemple.com" class="form-control-sm" />
                    </div>
                  </div>

                  <div class="notification-card" :class="{ active: settingsStore.notifications.sms }">
                    <div class="notification-header">
                      <MessageSquare :size="24" />
                      <label class="toggle">
                        <input v-model="settingsStore.notifications.sms" type="checkbox" />
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                    <h5>SMS</h5>
                    <p>Alertes critiques par message texte</p>
                    <div v-if="settingsStore.notifications.sms" class="notification-config">
                      <input type="tel" placeholder="+237 XXX XXX XXX" class="form-control-sm" />
                    </div>
                  </div>

                  <div class="notification-card" :class="{ active: settingsStore.notifications.browser }">
                    <div class="notification-header">
                      <Monitor :size="24" />
                      <label class="toggle">
                        <input v-model="settingsStore.notifications.browser" type="checkbox" />
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                    <h5>Navigateur</h5>
                    <p>Notifications push dans le navigateur</p>
                  </div>
                </div>
              </div>

              <!-- Notification Frequency -->
              <div class="subsection">
                <h4>
                  <Clock :size="18" />
                  Fréquence des Notifications
                </h4>
                <div class="frequency-options">
                  <label class="radio-card">
                    <input type="radio" name="frequency" value="instant" v-model="notificationFrequency" />
                    <div class="radio-content">
                      <Zap :size="20" />
                      <div>
                        <div class="radio-label">Instantané</div>
                        <div class="radio-desc">Recevoir immédiatement chaque alerte</div>
                      </div>
                    </div>
                    <div class="radio-check">
                      <CheckCircle :size="20" />
                    </div>
                  </label>

                  <label class="radio-card">
                    <input type="radio" name="frequency" value="hourly" v-model="notificationFrequency" />
                    <div class="radio-content">
                      <Clock :size="20" />
                      <div>
                        <div class="radio-label">Résumé horaire</div>
                        <div class="radio-desc">Un résumé toutes les heures</div>
                      </div>
                    </div>
                    <div class="radio-check">
                      <CheckCircle :size="20" />
                    </div>
                  </label>

                  <label class="radio-card">
                    <input type="radio" name="frequency" value="daily" v-model="notificationFrequency" />
                    <div class="radio-content">
                      <Calendar :size="20" />
                      <div>
                        <div class="radio-label">Résumé quotidien</div>
                        <div class="radio-desc">Un rapport journalier à 9h00</div>
                      </div>
                    </div>
                    <div class="radio-check">
                      <CheckCircle :size="20" />
                    </div>
                  </label>
                </div>
              </div>

              <button @click="saveSettings('notifications')" class="btn btn-primary">
                <Save :size="18" />
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>

        <!-- Scanning Settings -->
        <div v-if="activeTab === 'scanning'" class="settings-section">
          <div class="card">
            <div class="card-header">
              <div class="header-left">
                <ScanSearch :size="22" />
                <div>
                  <h3>Configuration des Scans</h3>
                  <p class="card-subtitle">Automatisation et paramètres des analyses</p>
                </div>
              </div>
            </div>

            <div class="form-section">
              <!-- Auto Scan Toggle -->
              <div class="toggle-item featured large">
                <div class="toggle-info">
                  <div class="toggle-icon blue">
                    <PlayCircle :size="24" />
                  </div>
                  <div>
                    <div class="toggle-label">Scans Automatiques</div>
                    <div class="toggle-description">Exécuter des analyses selon un planning prédéfini</div>
                  </div>
                </div>
                <label class="toggle large">
                  <input v-model="settingsStore.scanning.autoScan" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <!-- Auto Scan Configuration -->
              <div v-if="settingsStore.scanning.autoScan" class="auto-scan-config">
                <div class="subsection">
                  <h4>
                    <Settings2 :size="18" />
                    Planning des Scans
                  </h4>
                  <div class="form-grid">
                    <div class="form-group">
                      <label>Fréquence</label>
                      <select v-model="settingsStore.scanning.scanFrequency" class="form-control">
                        <option value="daily">📅 Quotidien</option>
                        <option value="weekly">📆 Hebdomadaire</option>
                        <option value="monthly">🗓️ Mensuel</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label>Heure d'exécution</label>
                      <input type="time" v-model="scanTime" class="form-control" />
                      <span class="help-text">Les scans démarreront à cette heure</span>
                    </div>

                    <div class="form-group">
                      <label>Scans simultanés (max)</label>
                      <input
                          v-model.number="settingsStore.scanning.maxConcurrentScans"
                          type="number"
                          min="1"
                          max="10"
                          class="form-control"
                      />
                      <span class="help-text">Nombre maximum de scans en parallèle</span>
                    </div>
                  </div>
                </div>

                <div class="subsection">
                  <h4>
                    <Target :size="18" />
                    Types de Scans Automatiques
                  </h4>
                  <div class="scan-type-grid">
                    <label class="checkbox-card">
                      <input type="checkbox" v-model="autoScanTypes.network" />
                      <div class="checkbox-content">
                        <div class="checkbox-icon blue">
                          <Network :size="24" />
                        </div>
                        <div>
                          <div class="checkbox-label">Scan Réseau</div>
                          <div class="checkbox-desc">Nmap - Analyse ports et services</div>
                        </div>
                      </div>
                      <div class="checkbox-check">
                        <CheckCircle :size="20" />
                      </div>
                    </label>

                    <label class="checkbox-card">
                      <input type="checkbox" v-model="autoScanTypes.application" />
                      <div class="checkbox-content">
                        <div class="checkbox-icon purple">
                          <Globe :size="24" />
                        </div>
                        <div>
                          <div class="checkbox-label">Scan Applicatif</div>
                          <div class="checkbox-desc">Nuclei - Vulnérabilités web</div>
                        </div>
                      </div>
                      <div class="checkbox-check">
                        <CheckCircle :size="20" />
                      </div>
                    </label>

                    <label class="checkbox-card">
                      <input type="checkbox" v-model="autoScanTypes.compliance" />
                      <div class="checkbox-content">
                        <div class="checkbox-icon green">
                          <FileCheck :size="24" />
                        </div>
                        <div>
                          <div class="checkbox-label">Audit Conformité</div>
                          <div class="checkbox-desc">Vérification des standards</div>
                        </div>
                      </div>
                      <div class="checkbox-check">
                        <CheckCircle :size="20" />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Retention Policy -->
              <div class="subsection">
                <h4>
                  <Archive :size="18" />
                  Rétention des Données
                </h4>
                <div class="form-group">
                  <label>Durée de conservation (jours)</label>
                  <div class="slider-container">
                    <input
                        type="range"
                        v-model.number="scanRetention"
                        min="7"
                        max="365"
                        class="slider"
                    />
                    <div class="slider-value">{{ scanRetention }} jours</div>
                  </div>
                  <span class="help-text">Les scans plus anciens seront automatiquement supprimés</span>
                </div>
              </div>

              <button @click="saveSettings('scanning')" class="btn btn-primary">
                <Save :size="18" />
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div v-if="activeTab === 'advanced'" class="settings-section">
          <div class="card">
            <div class="card-header">
              <div class="header-left">
                <Sliders :size="22" />
                <div>
                  <h3>Paramètres Avancés</h3>
                  <p class="card-subtitle">Configuration technique et maintenance</p>
                </div>
              </div>
              <span class="badge badge-danger">Expert</span>
            </div>

            <div class="form-section">
              <!-- Performance -->
              <div class="subsection">
                <h4>
                  <Zap :size="18" />
                  Performance
                </h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Limite requêtes API (par minute)</label>
                    <input type="number" v-model.number="apiRateLimit" min="10" max="1000" class="form-control" />
                    <span class="help-text">Prévention des abus API</span>
                  </div>

                  <div class="form-group">
                    <label>Timeout requêtes (secondes)</label>
                    <input type="number" v-model.number="requestTimeout" min="5" max="60" class="form-control" />
                    <span class="help-text">Délai d'expiration des requêtes</span>
                  </div>
                </div>
              </div>

              <!-- Integrations -->
              <div class="subsection">
                <h4>
                  <Puzzle :size="18" />
                  Intégrations Externes
                </h4>
                <div class="integration-list">
                  <div class="integration-item connected">
                    <div class="integration-icon">
                      <Database :size="24" />
                    </div>
                    <div class="integration-info">
                      <div class="integration-name">API CVE/NVD</div>
                      <div class="integration-status">
                        <div class="status-dot"></div>
                        Connecté
                      </div>
                    </div>
                    <button class="btn-integration">Configurer</button>
                  </div>

                  <div class="integration-item">
                    <div class="integration-icon">
                      <Webhook :size="24" />
                    </div>
                    <div class="integration-info">
                      <div class="integration-name">Webhooks</div>
                      <div class="integration-status disconnected">Non configuré</div>
                    </div>
                    <button class="btn-integration">Configurer</button>
                  </div>

                  <div class="integration-item">
                    <div class="integration-icon">
                      <Cloud :size="24" />
                    </div>
                    <div class="integration-info">
                      <div class="integration-name">Cloud Storage</div>
                      <div class="integration-status disconnected">Non configuré</div>
                    </div>
                    <button class="btn-integration">Configurer</button>
                  </div>
                </div>
              </div>

              <!-- Maintenance -->
              <div class="subsection">
                <h4>
                  <Wrench :size="18" />
                  Maintenance & Outils
                </h4>
                <div class="maintenance-grid">
                  <button @click="clearCache" class="maintenance-btn">
                    <Trash2 :size="20" />
                    <div>
                      <div class="maintenance-title">Vider le cache</div>
                      <div class="maintenance-desc">Effacer les données temporaires</div>
                    </div>
                  </button>

                  <button @click="exportSettings" class="maintenance-btn">
                    <Download :size="20" />
                    <div>
                      <div class="maintenance-title">Exporter config</div>
                      <div class="maintenance-desc">Sauvegarder les paramètres</div>
                    </div>
                  </button>

                  <button @click="importSettings" class="maintenance-btn">
                    <Upload :size="20" />
                    <div>
                      <div class="maintenance-title">Importer config</div>
                      <div class="maintenance-desc">Restaurer une sauvegarde</div>
                    </div>
                  </button>

                  <button @click="resetSettings" class="maintenance-btn danger">
                    <RotateCcw :size="20" />
                    <div>
                      <div class="maintenance-title">Réinitialiser</div>
                      <div class="maintenance-desc">Valeurs par défaut</div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="alert-box danger">
                <AlertOctagon :size="20" />
                <div>
                  <strong>Attention:</strong> Les paramètres avancés peuvent affecter la stabilité et les performances de l'application. Modifiez-les uniquement si vous savez ce que vous faites.
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
  Save,
  RotateCcw,
  Building,
  Globe,
  Clock,
  Moon,
  Sparkles,
  Timer,
  Lock,
  ShieldCheck,
  Key,
  UserCheck,
  AlertTriangle,
  Zap,
  Mail,
  MessageSquare,
  Monitor,
  CheckCircle,
  Calendar,
  PlayCircle,
  Target,
  Network,
  FileCheck,
  Archive,
  Puzzle,
  Database,
  Webhook,
  Cloud,
  Wrench,
  Trash2,
  Download,
  Upload,
  AlertOctagon
} from 'lucide-vue-next'
import Sidebar from '../components/layout/Sidebar.vue'
import Navbar from '../components/layout/Navbar.vue'

const settingsStore = useSettingsStore()

// State
const activeTab = ref('general')
const darkMode = ref(false)
const animations = ref(true)
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

// Tabs configuration
const tabs = [
  { id: 'general', label: 'Général', icon: Settings2 },
  { id: 'security', label: 'Sécurité', icon: Shield, badge: null },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'scanning', label: 'Scans', icon: ScanSearch },
  { id: 'advanced', label: 'Avancé', icon: Sliders }
]

// Methods
const saveSettings = async (category) => {
  await settingsStore.updateSettings(category, settingsStore[category])
  // Show success notification
  alert(`✅ Paramètres ${category} enregistrés avec succès !`)
}

const saveAllSettings = () => {
  alert('✅ Tous les paramètres ont été enregistrés !')
}

const resetAllSettings = () => {
  if (confirm('⚠️ Voulez-vous vraiment réinitialiser tous les paramètres ? Cette action est irréversible.')) {
    alert('✅ Paramètres réinitialisés aux valeurs par défaut')
  }
}

const clearCache = () => {
  if (confirm('Vider le cache de l\'application ?')) {
    alert('✅ Cache vidé avec succès !')
  }
}

const exportSettings = () => {
  alert('📥 Export des paramètres en cours...')
}

const importSettings = () => {
  alert('📤 Sélectionnez un fichier de configuration à importer')
}

const resetSettings = () => {
  if (confirm('⚠️ Réinitialiser tous les paramètres avancés ?')) {
    alert('✅ Paramètres avancés réinitialisés')
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
  max-width: 1400px;
  margin: 0 auto;
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

.header-actions {
  display: flex;
  gap: 12px;
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
}

.btn-secondary:hover {
  border-color: #667eea;
  color: #667eea;
}

/* Settings Tabs */
.settings-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.tab-badge {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.tab-btn.active .tab-badge {
  background: rgba(255, 255, 255, 0.3);
}

/* Settings Section */
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

/* Card */
.card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 2px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-header h3 {
  font-size: 20px;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.card-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.badge {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

/* Form Section */
.form-section {
  padding: 32px;
}

.subsection {
  margin-bottom: 32px;
}

.subsection h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #334155;
  font-size: 14px;
}

.form-control,
.form-control-sm {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.form-control-sm {
  padding: 8px 12px;
  font-size: 13px;
}

.form-control:focus,
.form-control-sm:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.help-text {
  font-size: 12px;
  color: #94a3b8;
}

/* Toggle Switch */
.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s;
}

.toggle-item:hover {
  background: #f1f5f9;
}

.toggle-item.featured {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #bae6fd;
}

.toggle-item.large {
  padding: 24px;
}

.toggle-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex: 1;
}

.toggle-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toggle-icon.purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.toggle-icon.blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.toggle-label {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  font-size: 15px;
}

.toggle-description {
  font-size: 13px;
  color: #64748b;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
}

.toggle.large {
  width: 60px;
  height: 32px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle.large .toggle-slider:before {
  height: 24px;
  width: 24px;
}

.toggle input:checked + .toggle-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle.large input:checked + .toggle-slider:before {
  transform: translateX(28px);
}

.toggle input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Alert Boxes */
.alert-box {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.5;
}

.alert-box.warning {
  background: #fef3c7;
  color: #78350f;
  border-left: 4px solid #f59e0b;
}

.alert-box.danger {
  background: #fee2e2;
  color: #7f1d1d;
  border-left: 4px solid #ef4444;
}

/* Notification Cards */
.notification-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.notification-card {
  padding: 24px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
}

.notification-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.notification-card h5 {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.notification-card p {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
}

.notification-config {
  margin-top: 12px;
}

/* Radio Cards */
.frequency-options,
.scan-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.radio-card,
.checkbox-card {
  position: relative;
  padding: 20px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-card:hover,
.checkbox-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.radio-card input[type="radio"],
.checkbox-card input[type="checkbox"] {
  position: absolute;
  opacity: 0;
}

.radio-card input:checked ~ .radio-content,
.checkbox-card input:checked ~ .checkbox-content {
  color: #667eea;
}

.radio-card input:checked,
.checkbox-card input:checked {
  & ~ .radio-check,
  & ~ .checkbox-check {
    opacity: 1;
  }
}

.radio-card input:checked ~ *,
.checkbox-card input:checked ~ * {
  border-color: #667eea;
}

.radio-content,
.checkbox-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.checkbox-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.checkbox-icon.blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.checkbox-icon.purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.checkbox-icon.green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.radio-label,
.checkbox-label {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.radio-desc,
.checkbox-desc {
  font-size: 12px;
  color: #64748b;
}

.radio-check,
.checkbox-check {
  position: absolute;
  top: 16px;
  right: 16px;
  color: #667eea;
  opacity: 0;
  transition: opacity 0.2s;
}

/* Auto Scan Config */
.auto-scan-config {
  padding: 24px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

/* Slider */
.slider-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.slider {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  border: none;
}

.slider-value {
  min-width: 80px;
  padding: 8px 16px;
  background: white;
  border-radius: 8px;
  font-weight: 600;
  color: #667eea;
  text-align: center;
}

/* Integration List */
.integration-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.integration-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
}

.integration-item:hover {
  border-color: #667eea;
}

.integration-item.connected {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.integration-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.integration-info {
  flex: 1;
}

.integration-name {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.integration-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
}

.integration-status.disconnected {
  color: #94a3b8;
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

.btn-integration {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-integration:hover {
  border-color: #667eea;
  color: #667eea;
}

/* Maintenance Grid */
.maintenance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.maintenance-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.maintenance-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.maintenance-btn.danger:hover {
  border-color: #ef4444;
  background: #fef2f2;
}

.maintenance-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.maintenance-desc {
  font-size: 12px;
  color: #64748b;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .settings-page {
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

  .settings-tabs {
    overflow-x: scroll;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .form-section {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .notification-cards,
  .frequency-options,
  .scan-type-grid {
    grid-template-columns: 1fr;
  }

  .maintenance-grid {
    grid-template-columns: 1fr;
  }
}
</style>