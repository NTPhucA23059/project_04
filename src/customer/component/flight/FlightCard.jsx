
import { MdFlight } from "react-icons/md";
import { formatPrice } from "./formatPrice";
import { Link } from "react-router-dom";

export default function FlightCard({ item }) {
  if (!item) return null; // 🛡️ tránh crash khi data null

  const fromName = item.fromCityName || "—";
  const toName = item.toCityName || "—";

  return (
    <Link to={`/flights/${item.flightID}`} className="block">
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden hover:shadow-lg hover:border-primary-300 transition cursor-pointer">
        {/* IMAGE (fallback an toàn) */}
        <img
          src={
            item.imageUrl ||
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1000&q=80"
          }
          className="h-44 w-full object-cover"
          alt={item.airline}
        />

        <div className="p-4 space-y-2">
          {/* AIRLINE + CODE */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg text-neutral-900">
              {item.airline}
            </h2>
            <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700">
              {item.flightCode}
            </span>
          </div>

          {/* ROUTE */}
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <MdFlight className="text-primary-500" />
            <p>
              <span className="font-semibold text-neutral-900">{fromName}</span>{" "}
              <span className="text-neutral-400">→</span>{" "}
              <span className="font-semibold text-neutral-900">{toName}</span>
            </p>
          </div>

          {/* TYPE + PRICE */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
              {item.flightType || "Direct"}
            </span>
            <span className="text-base font-bold text-primary-600">
              {formatPrice(item.price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
