
export function isProduction() {
  return process?.env?.NODE_ENV == 'production'
}

export function isAvocaptureDebug() {
  return process?.env?.AVOCAPTURE_DEBUG == 'true'
}