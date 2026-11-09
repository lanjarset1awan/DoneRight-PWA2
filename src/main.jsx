import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Auto-register & update DoneRight PWA Service Worker
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
  onOfflineReady() {
    console.log('DoneRight PWA is offline-ready.')
  },
})

// Clear any stale caches from earlier lab templates (e.g. Bore & Barrel)
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key.toLowerCase().includes('bore') || key.toLowerCase().includes('barrel') || key.toLowerCase().includes('gunshop')) {
        caches.delete(key)
      }
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
