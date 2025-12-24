<template>
  <div class="scan-results">
    <div class="results-header">
      <h3>Résultats du Scan</h3>
      <div class="results-meta">
        <span class="meta-item">
          <Clock :size="16" />
          Durée: {{ scanDuration }}
        </span>
        <span class="meta-item">
          <Target :size="16" />
          Cible: {{ scan.target }}
        </span>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="results-stats">
      <div class="stat-card">
        <div class="stat-icon hosts">
          <Server :size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ results.hostsDiscovered || 0 }}</div>
          <div class="stat-label">Hôtes Découverts</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon ports">
          <Network :size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ results.openPorts || 0 }}</div>
          <div class="stat-label">Ports Ouverts</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon services">
          <Activity :size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ results.servicesDetected || 0 }}</div>
          <div class="stat-label">Services Détectés</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon vulnerabilities">
          <AlertTriangle :size="20" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ results.vulnerabilities || 0 }}</div>
          <div class="stat-label">Vulnérabilités</div>
        </div>
      </div>
    </div>

    <!-- Detailed Results Tabs -->
    <div class="results-tabs">
      <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
      >
        <component :is="tab.icon" :size="18" />
        {{ tab.label }}
        <span v-if="tab.count" class="tab-badge">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Hosts Tab -->
    <div v-if="activeTab === 'hosts'" class="tab-content">
      <div class="hosts-list">
        <div v-for="host in results.hosts" :key="host.ip" class="host-item">
          <div class="host-header">
            <div class="host-ip">
              <Server :size="18" />
              {{ host.ip }}
            </div>
            <span class="host-status" :class="host.status">{{ host.status }}</span>
          </div>
          <div class="host-details">
            <div v-if="host.hostname" class="detail-item">
              <strong>Hostname:</strong> {{ host.hostname }}
            </div>
            <div v-if="host.os" class="detail-item">
              <strong>OS:</strong> {{ host.os }}
            </div>
            <div class="detail-item">
              <strong>Ports ouverts:</strong> {{ host.openPorts }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ports Tab -->
    <div v-if="activeTab === 'ports'" class="tab-content">
      <div class="ports-table">
        <div class="table-header">
          <div>Port</div>
          <div>Protocole</div>
          <div>État</div>
          <div>Service</div>
          <div>Version</div>
        </div>
        <div v-for="port in results.portsList" :key="`${port.port}-${port.protocol}`" class="table-row">
          <div class="port-number">{{ port.port }}</div>
          <div>{{ port.protocol }}</div>
          <div><span class="status-badge" :class="port.state">{{ port.state }}</span></div>
          <div>{{ port.service }}</div>
          <div class="version-cell">{{ port.version || '-' }}</div>
        </div>
      </div>
    </div>

    <!-- Services Tab -->
    <div v-if="activeTab === 'services'" class="tab-content">
      <div class="services-grid">
        <div v-for="service in results.servicesList" :key="service.name" class="service-card">
          <div class="service-icon">
            <Activity :size="20" />
          </div>
          <div class="service-info">
            <div class="service-name">{{ service.name }}</div>
            <div class="service-version">{{ service.version }}</div>
            <div class="service-port">Port: {{ service.port }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vulnerabilities Tab -->
    <div v-if="activeTab === 'vulnerabilities'" class="tab-content">
      <div v-if="results.vulnerabilitiesList && results.vulnerabilitiesList.length > 0" class="vulnerabilities-list">
        <div v-for="vuln in results.vulnerabilitiesList" :key="vuln.id" class="vulnerability-item">
          <div class="vuln-header">
            <span class="severity-badge" :class="`severity-${vuln.severity}`">
              {{ vuln.severity }}
            </span>
            <span class="vuln-cve">{{ vuln.cve }}</span>
          </div>
          <div class="vuln-title">{{ vuln.title }}</div>
          <div class="vuln-description">{{ vuln.description }}</div>
          <div class="vuln-footer">
            <span>CVSS: {{ vuln.cvss }}</span>
            <button class="btn-details">Voir détails</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-vulnerabilities">
        <CheckCircle :size="48" />
        <p>Aucune vulnérabilité détectée</p>
      </div>
    </div>

    <!-- Raw Output Tab -->
    <div v-if="activeTab === 'raw'" class="tab-content">
      <div class="raw-output">
        <pre>{{ results.rawOutput || 'Sortie brute non disponible' }}</pre>
      </div>
    </div>

    <!-- Export Actions -->
    <div class="results-actions">
      <button @click="exportResults('pdf')" class="btn btn-secondary">
        <FileDown :size="18" />
        Exporter PDF
      </button>
      <button @click="exportResults('json')" class="btn btn-secondary">
        <Code :size="18" />
        Exporter JSON
      </button>
      <button @click="shareResults" class="btn btn-primary">
        <Share2 :size="18" />
        Partager
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Clock,
  Target,
  Server,
  Network,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileDown,
  Code,
  Share2
} from 'lucide-vue-next'

const props = defineProps({
  scan: {
    type: Object,
    required: true
  }
})

const activeTab = ref('hosts')

// Mock results - remplacer par les vraies données de votre API
const results = ref({
  hostsDiscovered: 12,
  openPorts: 47,
  servicesDetected: 23,
  vulnerabilities: 5,
  hosts: [
    {
      ip: '192.168.1.1',
      hostname: 'router.local',
      status: 'up',
      os: 'Linux 4.x',
      openPorts: 8
    },
    {
      ip: '192.168.1.10',
      hostname: 'server01.local',
      status: 'up',
      os: 'Ubuntu 22.04',
      openPorts: 15
    },
    {
      ip: '192.168.1.20',
      hostname: 'workstation01.local',
      status: 'up',
      os: 'Windows 10',
      openPorts: 12
    }
  ],
  portsList: [
    { port: 22, protocol: 'tcp', state: 'open', service: 'SSH', version: 'OpenSSH 8.2' },
    { port: 80, protocol: 'tcp', state: 'open', service: 'HTTP', version: 'nginx 1.18' },
    { port: 443, protocol: 'tcp', state: 'open', service: 'HTTPS', version: 'nginx 1.18' },
    { port: 3306, protocol: 'tcp', state: 'open', service: 'MySQL', version: '8.0.25' },
    { port: 5432, protocol: 'tcp', state: 'open', service: 'PostgreSQL', version: '13.4' }
  ],
  servicesList: [
    { name: 'Apache HTTP Server', version: '2.4.41', port: 80 },
    { name: 'OpenSSH', version: '8.2p1', port: 22 },
    { name: 'MySQL', version: '8.0.25', port: 3306 },
    { name: 'PostgreSQL', version: '13.4', port: 5432 }
  ],
  vulnerabilitiesList: [
    {
      id: 1,
      cve: 'CVE-2024-1234',
      severity: 'high',
      cvss: 8.1,
      title: 'OpenSSH Version Obsolète',
      description: 'La version d\'OpenSSH installée présente des vulnérabilités connues'
    },
    {
      id: 2,
      cve: 'CVE-2024-5678',
      severity: 'medium',
      cvss: 6.5,
      title: 'Configuration HTTP Non Sécurisée',
      description: 'Le serveur HTTP n\'utilise pas HSTS'
    }
  ],
  rawOutput: `Starting Nmap 7.92 ( https://nmap.org )
Nmap scan report for 192.168.1.1
Host is up (0.0012s latency).
Not shown: 992 filtered ports
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https

Nmap done: 12 IP addresses (12 hosts up) scanned in 45.23 seconds`
})

const tabs = computed(() => [
  { id: 'hosts', label: 'Hôtes', icon: Server, count: results.value.hostsDiscovered },
  { id: 'ports', label: 'Ports', icon: Network, count: results.value.openPorts },
  { id: 'services', label: 'Services', icon: Activity, count: results.value.servicesDetected },
  { id: 'vulnerabilities', label: 'Vulnérabilités', icon: AlertTriangle, count: results.value.vulnerabilities },
  { id: 'raw', label: 'Sortie Brute', icon: Code }
])

const scanDuration = computed(() => {
  if (props.scan.startDate && props.scan.endDate) {
    const duration = new Date(props.scan.endDate) - new Date(props.scan.startDate)
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
  return 'N/A'
})

const exportResults = (format) => {
  alert(`Export des résultats en format ${format.toUpperCase()}...`)
}

const shareResults = () => {
  alert('Partage des résultats (fonctionnalité à implémenter)')
}
</script>

<style scoped>
.scan-results {
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.results-header {
  margin-bottom: 24px;
}

.results-header h3 {
  font-size: 24px;
  color: #1e293b;
  margin-bottom: 12px;
}

.results-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
}

.results-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.hosts {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-icon.ports {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-icon.services {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-icon.vulnerabilities {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.results-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #f1f5f9;
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-button:hover {
  color: #667eea;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-badge {
  padding: 2px 8px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.tab-content {
  min-height: 300px;
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

.hosts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.host-item {
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 4px solid #3b82f6;
}

.host-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.host-ip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #1e293b;
  font-size: 16px;
}

.host-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.host-status.up {
  background: #d1fae5;
  color: #065f46;
}

.host-status.down {
  background: #fee2e2;
  color: #991b1b;
}

.host-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  font-size: 14px;
  color: #64748b;
}

.detail-item strong {
  color: #475569;
}

.ports-table {
  background: #f8fafc;
  border-radius: 10px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 120px 100px 1fr 1fr;
  gap: 16px;
  padding: 16px 20px;
  background: #e2e8f0;
  font-weight: 700;
  font-size: 13px;
  color: #475569;
  text-transform: uppercase;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 120px 100px 1fr 1fr;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
}

.table-row:hover {
  background: #f1f5f9;
}

.port-number {
  font-weight: 700;
  color: #1e293b;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.open {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.closed {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.filtered {
  background: #fef3c7;
  color: #92400e;
}

.version-cell {
  font-family: monospace;
  font-size: 13px;
  color: #64748b;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.service-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.2s;
}

.service-card:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.service-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-info {
  flex: 1;
}

.service-name {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.service-version {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.service-port {
  font-size: 12px;
  color: #94a3b8;
}

.vulnerabilities-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vulnerability-item {
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 4px solid;
}

.vulnerability-item:has(.severity-critical) {
  border-left-color: #ef4444;
}

.vulnerability-item:has(.severity-high) {
  border-left-color: #f59e0b;
}

.vulnerability-item:has(.severity-medium) {
  border-left-color: #3b82f6;
}

.vulnerability-item:has(.severity-low) {
  border-left-color: #10b981;
}

.vuln-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.severity-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.severity-critical {
  background: #fee2e2;
  color: #991b1b;
}

.severity-high {
  background: #fef3c7;
  color: #92400e;
}

.severity-medium {
  background: #dbeafe;
  color: #1e40af;
}

.severity-low {
  background: #d1fae5;
  color: #065f46;
}

.vuln-cve {
  font-family: monospace;
  font-weight: 600;
  color: #64748b;
}

.vuln-title {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.vuln-description {
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 12px;
}

.vuln-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #64748b;
}

.btn-details {
  padding: 6px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-details:hover {
  background: #5568d3;
}

.empty-vulnerabilities {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #10b981;
}

.empty-vulnerabilities p {
  margin-top: 16px;
  font-size: 16px;
}

.raw-output {
  background: #1e293b;
  border-radius: 10px;
  padding: 20px;
  overflow-x: auto;
}

.raw-output pre {
  color: #e2e8f0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

.results-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;
  justify-content: flex-end;
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

@media (max-width: 768px) {
  .results-stats {
    grid-template-columns: 1fr;
  }

  .results-tabs {
    flex-wrap: nowrap;
    overflow-x: scroll;
  }

  .table-header,
  .table-row {
    grid-template-columns: 80px 100px 80px 1fr 1fr;
    gap: 8px;
    font-size: 12px;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .results-actions {
    flex-direction: column;
  }
}
</style>