import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { refundRules } from "../../component/data/mockData";

export default function CarPricing({ car }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    if (!car) return null;

    const carId = car.CarID ?? car.carID;
    const dailyRate = Number(car.DailyRate ?? car.dailyRate ?? 0);

    const goCheckout = () =>
        navigate(`/checkoutCar/${carId}`, { state: { car } });

    return (
        <div className="p-6 bg-white border rounded-xl shadow">

            {/* PRICE */}
            <p className="text-3xl font-bold text-orange-600 mb-4">
                ${dailyRate}
                <span className="text-gray-600 text-lg font-medium"> /day</span>
            </p>

            {/* BOOK BUTTON */}
            <button
                onClick={goCheckout}
                className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
            >
                Book This Car
            </button>

            {/* COLLAPSE HEADER */}
            <button
                onClick={() => setOpen(!open)}
                className="mt-5 flex w-full justify-between py-2 text-gray-700 font-semibold"
            >
                <span>Price Details</span>
                {open ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            </button>

            {open && (
                <div className="mt-4 text-sm animate-fadeIn space-y-6">

                    {/* EXTRA FEES (chỉ hiển thị nếu có dữ liệu) */}
                    {(car.ExtraHourRate || car.ExtraKmRate || car.KmLimitPerDay) && (
                        <div>
                            <p className="font-semibold mb-1">Extra Fees</p>
                            <ul className="ml-4 space-y-1 text-blue-700">
                                {car.ExtraHourRate && <li>• Extra hour: ${car.ExtraHourRate}</li>}
                                {car.ExtraKmRate && <li>• Extra km: ${car.ExtraKmRate}</li>}
                                {car.KmLimitPerDay && <li>• Km limit/day: {car.KmLimitPerDay} km</li>}
                            </ul>
                        </div>
                    )}

                    {/* SPECIAL PRICES (chỉ hiển thị nếu có dữ liệu) */}
                    {(car.WeekendRate || car.HolidayRate) && (
                        <div>
                            <p className="font-semibold mb-1">Special Rates</p>
                            <ul className="ml-4 space-y-1">
                                {car.WeekendRate && <li>• Weekend: ${car.WeekendRate}</li>}
                                {car.HolidayRate && <li>• Holiday: ${car.HolidayRate}</li>}
                            </ul>
                        </div>
                    )}

                    {/* REFUND POLICY */}
                    <div>
                        <p className="font-semibold mb-1">Refund Policy</p>
                        <ul className="ml-4 space-y-1 text-gray-700">
                            {refundRules.map((r, i) => (
                                <li key={i}>• {r.Label}</li>
                            ))}
                        </ul>
                    </div>

                </div>
            )}
        </div>
    );
}
