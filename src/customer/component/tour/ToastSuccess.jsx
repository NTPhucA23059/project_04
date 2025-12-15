import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function ToastSuccess({ message }) {
    return (
        <div
            className="
                fixed top-6 right-6 z-[9999]
                bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg
                flex items-center gap-3 animate-slide-in
            "
        >
            <CheckCircleIcon className="w-6 h-6 text-white" />
            <p className="font-medium">{message}</p>
        </div>
    );
}
