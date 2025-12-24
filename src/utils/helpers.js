export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export const getSeverityColor = (severity) => {
    const colors = {
        critical: '#ef4444',
        high: '#f59e0b',
        medium: '#3b82f6',
        low: '#10b981'
    }
    return colors[severity] || '#6b7280'
}

export const getSeverityBadgeClass = (severity) => {
    const classes = {
        critical: 'badge-critical',
        high: 'badge-high',
        medium: 'badge-medium',
        low: 'badge-low'
    }
    return classes[severity] || 'badge-medium'
}

export const truncate = (text, length = 50) => {
    if (!text) return ''
    return text.length > length ? text.substring(0, length) + '...' : text
}

export const downloadFile = (data, filename, type = 'text/plain') => {
    const blob = new Blob([data], { type })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}