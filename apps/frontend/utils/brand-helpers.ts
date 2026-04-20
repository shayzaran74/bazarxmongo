/**
 * Brand Status and Application Type Helpers
 * Shared between Admin and Vendor Brand Management
 */

export const getApplicationTypeBadge = (type: string) => {
  switch (type) {
    case 'OWNER': return 'bg-blue-100 text-blue-700'
    case 'AUTHORIZED_SELLER': return 'bg-purple-100 text-purple-700'
    case 'DISTRIBUTOR': return 'bg-indigo-100 text-indigo-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export const getApplicationTypeLabel = (type: string) => {
  switch (type) {
    case 'OWNER': return 'Marka Sahibi'
    case 'AUTHORIZED_SELLER': return 'Yetkili Satıcı'
    case 'DISTRIBUTOR': return 'Distribütör'
    default: return 'Belirtilmemiş'
  }
}

export const getStatusBadgeClass = (status: string, additionalDocsRequestedAt?: any) => {
  if (status === 'PENDING' && additionalDocsRequestedAt) {
    return 'bg-orange-50 text-orange-700 border-orange-200'
  }

  switch (status) {
    case 'APPROVED': return 'bg-green-50 text-green-700 border-green-200'
    case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200'
    case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

export const getStatusLabel = (status: string, additionalDocsRequestedAt?: any) => {
  if (status === 'PENDING' && additionalDocsRequestedAt) {
    return 'Belge Talep Edildi'
  }

  switch (status) {
    case 'APPROVED': return 'Onaylı'
    case 'REJECTED': return 'Reddedilmiş'
    case 'PENDING': return 'Beklemede'
    default: return status || 'Bilinmiyor'
  }
}
