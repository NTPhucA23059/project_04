import { ClockIcon } from "@heroicons/react/24/outline";

export default function RefundPolicy() {
    return (
        <section className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 p-6">
            <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                <ClockIcon className="w-6 h-6" />
                Refund & Cancellation Policy
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
                <div className="p-3 bg-white rounded-lg border border-orange-100">
                    <p className="font-semibold text-orange-700 mb-1">≥ 5 days before departure:</p>
                    <p>Refund <strong className="text-green-600">95%</strong> of tour value</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-orange-100">
                    <p className="font-semibold text-orange-700 mb-1">4 days before departure:</p>
                    <p>Refund <strong className="text-green-600">90%</strong> of tour value</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-orange-100">
                    <p className="font-semibold text-orange-700 mb-1">3 days before departure:</p>
                    <p>Refund <strong className="text-green-600">85%</strong> of tour value</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-orange-100">
                    <p className="font-semibold text-orange-700 mb-1">2 days before departure:</p>
                    <p>Refund <strong className="text-green-600">80%</strong> of tour value</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-orange-100">
                    <p className="font-semibold text-orange-700 mb-1">1 day before departure:</p>
                    <p>Refund <strong className="text-green-600">75%</strong> of tour value</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg border-2 border-red-300">
                    <p className="font-bold text-red-700 mb-1">Departure day or after:</p>
                    <p className="text-red-800"><strong>NO</strong> refund</p>
                </div>
            </div>
            <p className="text-xs text-gray-600 mt-4 italic">
                * Time is calculated from the cancellation time to the departure date according to the schedule.
            </p>
        </section>
    );
}

