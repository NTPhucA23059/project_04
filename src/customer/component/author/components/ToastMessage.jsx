export default function ToastMessage({ toast, onClose }) {
    if (!toast?.show) return null;

    return (
        <div
            className={`fixed top-6 right-6 z-[9999] px-6 py-4 rounded-lg shadow-xl 
                flex items-center gap-3 animate-slide-in 
                ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
        >
            <span className="font-medium">{toast.message}</span>
            <button className="font-bold" onClick={onClose}>×</button>
        </div>
    );
}











