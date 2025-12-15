import { FaCarSide, FaStar } from "react-icons/fa";

export default function CarInfo({ car, type, reviews = [] }) {
    if (!car) return null;

    const model = car.ModelName || car.modelName;
    const brand = car.Brand || car.brand;
    const seats = car.SeatingCapacity ?? car.seatingCapacity;
    const fuel = car.FuelType || car.fuelType;
    const transmission = car.Transmission || car.transmission;
    const year = car.ModelYear ?? car.modelYear;
    const plate = car.PlateNumber || car.plateNumber;
    const note = car.Note || car.note;

    const avgRating =
        reviews.length === 0
            ? "0.0"
            : (reviews.reduce((s, r) => s + (r.Rating ?? r.rating ?? 0), 0) / reviews.length).toFixed(1);

    return (
        <div className="space-y-3">

            <h1 className="text-3xl font-bold flex items-center gap-2">
                <FaCarSide className="text-orange-600" />
                {model}
            </h1>

            <div className="flex items-center gap-2 text-yellow-500">
                <FaStar />
                <span className="font-semibold text-gray-800">{avgRating}</span>
                <span className="text-gray-500 text-sm">{reviews.length} reviews</span>
            </div>

            <div className="text-gray-700 text-sm space-y-1">
                <p><strong>Brand:</strong> {brand || "—"}</p>
                <p><strong>Type:</strong> {type?.TypeName || type?.typeName || "—"}</p>
                <p><strong>Seats:</strong> {seats ?? "—"}</p>
                <p><strong>Fuel:</strong> {fuel || "—"}</p>
                <p><strong>Transmission:</strong> {transmission || "—"}</p>
                <p><strong>Year:</strong> {year ?? "—"}</p>
                <p><strong>Plate:</strong> {plate || "—"}</p>
            </div>

            {note && <p className="text-gray-700 mt-4">{note}</p>}
        </div>
    );
}
