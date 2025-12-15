import { useState } from "react";
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ClipboardDocumentListIcon,
    ArrowPathIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";

export default function TourImportantNotes() {
    const [openKey, setOpenKey] = useState(null);

    const toggle = (key) => {
        setOpenKey(openKey === key ? null : key);
    };

    return (
        <section className="max-w-7xl mx-auto px-4 mt-12 space-y-4">

            {/* ===== TITLE ===== */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Important Notes When Joining the Tour
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Please review the information below carefully.
                </p>
            </div>

            {/* ===== ITEM ===== */}
            <AccordionItem
                title="Included in the Tour"
                icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />}
                open={openKey === "included"}
                onClick={() => toggle("included")}
            >
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                    <li>Transportation according to itinerary.</li>
                    <li>Meals and hotel accommodation as specified.</li>
                    <li>Entrance fees and professional tour guide.</li>
                    <li>Travel insurance (up to 100,000,000 VND/person).</li>
                </ul>
            </AccordionItem>

            <AccordionItem
                title="Not Included"
                icon={<XCircleIcon className="h-6 w-6 text-red-600" />}
                open={openKey === "excluded"}
                onClick={() => toggle("excluded")}
            >
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                    <li>Personal expenses.</li>
                    <li>Tips for driver and tour guide.</li>
                </ul>
            </AccordionItem>

            <AccordionItem
                title="General Notes"
                icon={<InformationCircleIcon className="h-6 w-6 text-blue-600" />}
                open={openKey === "general"}
                onClick={() => toggle("general")}
            >
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                    <li>Program order may change.</li>
                    <li>Guests aged 70+ must travel with a guardian.</li>
                    <li>No compensation in force majeure cases.</li>
                </ul>
            </AccordionItem>

            <AccordionItem
                title="Air Travel Notes"
                icon={<ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />}
                open={openKey === "air"}
                onClick={() => toggle("air")}
            >
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                    <li>Name must match ID/Passport.</li>
                    <li>Arrive at airport 120 minutes early.</li>
                </ul>
            </AccordionItem>

            <AccordionItem
                title="Refund Policy"
                icon={<ArrowPathIcon className="h-6 w-6 text-purple-600" />}
                open={openKey === "refund"}
                onClick={() => toggle("refund")}
            >
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                    <li>1 day prior: 75%</li>
                    <li>2 days prior: 80%</li>
                    <li>3 days prior: 85%</li>
                    <li>4 days prior: 90%</li>
                    <li>5+ days prior: 95%</li>
                </ul>
            </AccordionItem>
        </section>
    );
}

/* ===== SUB COMPONENT ===== */
function AccordionItem({ title, icon, open, onClick, children }) {
    return (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between p-5 text-left"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>

                <ChevronDownIcon
                    className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <div className="px-6 pb-5">
                    {children}
                </div>
            )}
        </div>
    );
}
