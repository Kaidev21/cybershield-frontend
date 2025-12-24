<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <Shield class="logo-icon" />
        </div>
        <h1>CyberShield</h1>
        <p>Plateforme de Cyberdéfense Managée</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Adresse email</label>
          <input
              id="email"
              v-model="credentials.email"
              type="email"
              placeholder="admin@cybershield.com"
              required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
              id="password"
              v-model="credentials.password"
              type="password"
              placeholder="••••••••"
              required
          />
        </div>

        <div v-if="error" class="error-message">
          <AlertCircle :size="16" />
          <span>{{ error }}</span>
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="!loading">Se connecter</span>
          <div v-else class="spinner"></div>
        </button>
      </form>

      <div class="login-footer">
        <p class="test-credentials">
          <Info :size="16" />
          <strong>Test:</strong> admin@cybershield.com / admin123
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Shield, AlertCircle, Info } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const credentials = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)

const handleLogin = async () => {
  loading.value = true
  error.value = null

  const result = await authStore.login(credentials.value)

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error
  }

  loading.value = false
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 48px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: inline-flex;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 16px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: white;
}

.login-header h1 {
  font-size: 28px;
  color: #1e293b;
  margin-bottom: 8px;
}

.login-header p {
  color: #64748b;
  font-size: 14px;
}

.login-form {
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
  font-weight: 500;
  color: #334155;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  font-size: 14px;
}

.btn-login {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 8px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.test-credentials {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 8px;
  font-size: 13px;
  justify-content: center;
}
</style>