import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    MapPinIcon,
} from "@heroicons/react/24/solid";

const statusConfig = {
    "Pending Processing": {
        color: "bg-orange-100 text-orange-700 border-orange-300",
        icon: <ClockIcon className="w-5 h-5 text-orange-600" />,
    },
    "Confirmed": {
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: <CheckCircleIcon className="w-5 h-5 text-blue-600" />,
    },
    "On-going": {
        color: "bg-indigo-100 text-indigo-700 border-indigo-300",
        icon: <MapPinIcon className="w-5 h-5 text-indigo-600" />,
    },
    "Completed": {
        color: "bg-green-100 text-green-700 border-green-300",
        icon: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
    },
    "Auto Cancelled": {
        color: "bg-red-200 text-red-700 border-red-400",
        icon: <XCircleIcon className="w-5 h-5 text-red-600" />,
    },
    "Refunded": {
        color: "bg-purple-200 text-purple-700 border-purple-400",
        icon: <XCircleIcon className="w-5 h-5 text-purple-600" />,
    },
};

export default function StatusBadge({ status }) {
    const { color, icon } = statusConfig[status] || statusConfig["Pending Processing"];
    return (
        <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full border ${color}`}
        >
            {icon}
            <span>{status}</span>
        </div>
    );
}

