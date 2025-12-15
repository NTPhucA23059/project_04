
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getFlightById } from "../../../services/customer/flightService";
import { getAllCities } from "../../../services/customer/cityService";
import { formatPrice } from "./formatPrice";
import { MdFlight } from "react-icons/md";

export default function FlightDetail() {
  function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);

    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDateOnly(value) {
    if (!value) return "—";
    const d = new Date(value);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatDuration(minutes) {
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}p` : `${m}p`;
  }

  const { id } = useParams();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flightRes, citiesRes] = await Promise.all([
          getFlightById(id),
          getAllCities(),
        ]);
        setFlight(flightRes);
        setCities(citiesRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fromCityName = useMemo(() => {
    if (!flight) return "";
    const found = cities.find((c) => c.cityID === flight.fromCityID);
    return found?.cityName || "—";
  }, [flight, cities]);

  const toCityName = useMemo(() => {
    if (!flight) return "";
    const found = cities.find((c) => c.cityID === flight.toCityID);
    return found?.cityName || "—";
  }, [flight, cities]);

  if (loading) {
    return <p className="text-center mt-20">Loading flight...</p>;
  }

  if (!flight) {
    return <p className="text-center mt-20">Flight not found</p>;
  }

  return (
    <div className="pt-24 bg-neutral-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Summary header */}
        <div className="rounded-2xl bg-white border border-neutral-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-500 uppercase font-semibold mb-1">
              Flight information
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
              {flight.airline}
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Flight code{" "}
              <span className="font-semibold text-neutral-900">
                {flight.flightCode}
              </span>
              , route{" "}
              <span className="font-semibold text-neutral-900">
                {fromCityName}{" "}
              </span>
              <span className="text-neutral-400">→</span>{" "}
              <span className="font-semibold text-neutral-900">
                {toCityName}
              </span>
              .
            </p>
          </div>

          <div className="text-right space-y-1">
            <p className="text-xs text-neutral-500">Reference price</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatPrice(flight.price)}
            </p>
            <span className="inline-block text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full">
              {flight.flightType || "Bay thẳng"}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: tuyến + thời gian + lịch trình */}
          <div className="md:col-span-2 space-y-4">
            {/* Route + times */}
            <div className="rounded-2xl bg-white border border-neutral-200 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <MdFlight className="text-primary-600" size={22} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-semibold">
                    Tuyến bay
                  </p>
                  <p className="text-base font-semibold text-neutral-900">
                    {fromCityName}{" "}
                    <span className="text-neutral-400">→</span> {toCityName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <p className="text-neutral-500 text-xs uppercase font-semibold">
                    Departure date
                  </p>
                  <p className="font-medium text-neutral-900 mt-1">
                    {formatDateOnly(flight.departureTime)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <p className="text-neutral-500 text-xs uppercase font-semibold">
                    Departure time
                  </p>
                  <p className="font-medium text-neutral-900 mt-1">
                    {formatDateTime(flight.departureTime)}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <p className="text-neutral-500 text-xs uppercase font-semibold">
                    Estimated arrival time
                  </p>
                  <p className="font-medium text-neutral-900 mt-1">
                    {formatDateTime(flight.arrivalTime)}
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-sm">
                <p className="text-neutral-500 text-xs uppercase font-semibold">
                  Flight duration
                </p>
                <p className="font-medium text-neutral-900 mt-1">
                  {formatDuration(flight.durationMinutes)}
                </p>
              </div>
            </div>

            {/* Schedule info (if present) */}
            {flight.scheduleInfo && (
              <div className="rounded-2xl bg-white border border-neutral-200 p-5">
                <p className="text-sm font-semibold text-neutral-900 mb-2">
                  Schedule notes
                </p>
                <p className="text-sm text-neutral-600 whitespace-pre-line">
                  {flight.scheduleInfo}
                </p>
              </div>
            )}
          </div>

          {/* Right: additional read-only info */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-neutral-200 p-5 text-sm space-y-3">
              <p className="text-sm font-semibold text-neutral-900">
                Additional details
              </p>
              <ul className="text-neutral-600 space-y-1 list-disc list-inside">
                <li>
                  <span className="font-medium">Airline:</span>{" "}
                  {flight.airline}
                </li>
                <li>
                  <span className="font-medium">Flight type:</span>{" "}
                  {flight.flightType || "Direct"}
                </li>
                <li>
                  <span className="font-medium">Status:</span>{" "}
                  {flight.status === 1 ? "Active" : "Inactive"}
                </li>
                <li>
                  <span className="font-medium">Price shown:</span>{" "}
                  for reference only and may change depending on booking time.
                </li>
                <li>
                  <span className="font-medium">Note:</span> to book this
                  flight, please use the airline&apos;s official channels or a
                  trusted agent.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
