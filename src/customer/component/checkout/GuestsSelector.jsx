import { UserIcon } from "@heroicons/react/24/outline";

export default function GuestsSelector({ form, errors, availableSeats, onUpdate }) {
    const inputBaseStyle = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200";
    const inputNormalStyle = `${inputBaseStyle} border-gray-300 focus:border-primary-500 focus:ring-primary-200`;
    const inputErrorStyle = `${inputBaseStyle} border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50`;

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-primary-600" />
                Number of Guests
            </h2>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adults <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="CapacityAdult"
                        type="number"
                        min="1"
                        max="50"
                        className={`${errors.CapacityAdult ? inputErrorStyle : inputNormalStyle} text-center`}
                        value={form.CapacityAdult}
                        onChange={(e) => {
                            const val = Math.max(1, Math.min(50, Number(e.target.value) || 1));
                            onUpdate("CapacityAdult", val);
                        }}
                    />
                    <p className="text-xs text-gray-500 mt-1">100% price</p>
                    {errors.CapacityAdult && (
                        <p className="text-red-600 text-xs mt-1">{errors.CapacityAdult}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Children
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="50"
                        className={`${inputNormalStyle} text-center`}
                        value={form.CapacityKid}
                        onChange={(e) => {
                            const val = Math.max(0, Math.min(50, Number(e.target.value) || 0));
                            onUpdate("CapacityKid", val);
                        }}
                    />
                    <p className="text-xs text-gray-500 mt-1">70% price</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Infants
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="50"
                        className={`${inputNormalStyle} text-center`}
                        value={form.CapacityBaby}
                        onChange={(e) => {
                            const val = Math.max(0, Math.min(50, Number(e.target.value) || 0));
                            onUpdate("CapacityBaby", val);
                        }}
                    />
                    <p className="text-xs text-gray-500 mt-1">30% price</p>
                </div>
            </div>

            {errors.TotalGuests && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm flex items-start gap-1">
                        <span>⚠</span>
                        <span>{errors.TotalGuests}</span>
                    </p>
                </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                    <strong>Available Seats:</strong> {availableSeats} seats
                </p>
            </div>
        </section>
    );
}

