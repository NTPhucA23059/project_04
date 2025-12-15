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
  const color = (
    toast.type === 'success' ? 'bg-green-600' :
      toast.type === 'error' ? 'bg-red-600' :
        toast.type === 'create' ? 'bg-blue-600' :
          toast.type === 'update' ? 'bg-amber-600' :
            toast.type === 'delete' ? 'bg-rose-600' :
              'bg-gray-800'
  )

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`${color} text-white px-5 py-4 rounded-xl shadow-2xl min-w-80 max-w-md flex items-center justify-between gap-4 border border-white/20 backdrop-blur-sm`}>
        <div className="flex items-center gap-3 flex-1">
          {toast.type === 'success' && (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
        <button 
          className="text-white/80 hover:text-white transition text-lg font-bold leading-none hover:scale-110" 
          onClick={() => setToast({ ...toast, visible: false })}
        >
          ×
        </button>
      </div>
    </div>
  )
}



