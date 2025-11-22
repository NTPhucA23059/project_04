import { useEffect, useState } from 'react'

export default function GlobalToast() {
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' })
  useEffect(() => {
    const onToast = (e) => {
      const { type = 'success', message = '' } = e.detail || {}
      setToast({ visible: true, type, message })
      window.clearTimeout(window.__toastTimer)
      window.__toastTimer = window.setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
    }
    window.addEventListener('toast', onToast)
    return () => window.removeEventListener('toast', onToast)
  }, [])

  if (!toast.visible) return null

  const color = toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800'

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <div className={`${color} text-white px-4 py-3 rounded-md shadow-lg min-w-64 max-w-sm flex items-center justify-between gap-4`}>
        <span className="text-sm">{toast.message}</span>
        <button className="text-white/80 hover:text-white text-sm" onClick={() => setToast({ ...toast, visible: false })}>×</button>
      </div>
    </div>
  )
}


