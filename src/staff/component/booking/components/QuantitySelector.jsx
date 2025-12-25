import React from "react";

function NumberField({ label, value, onChange, min = 0, error }) {
  return (
    <div className="mb-3">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <input
        type="number"
        min={min}
        className={`border ${
          error ? "border-red-300" : "border-neutral-200"
        } px-3 py-2 rounded-lg w-full text-sm mt-1.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition bg-white`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default function QuantitySelector({
  quantity,
  setQuantity,
  unitPrice,
  availableSeats,
  errors = {},
}) {
  const totalPrice =
    quantity.adults * unitPrice +
    quantity.children * unitPrice * 0.7 +
    quantity.infants * unitPrice * 0.3;

  const totalPeople = quantity.adults + quantity.children + quantity.infants;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
      <h3 className="font-bold text-neutral-900 mb-4 border-b border-primary-200 pb-2">
        3. Quantity & Total
      </h3>

      <NumberField
        label="Adults"
        min={1}
        value={quantity.adults}
        onChange={(v) => setQuantity({ ...quantity, adults: Number(v || 0) })}
        error={errors.adults}
      />
      <NumberField
        label="Children (70%)"
        min={0}
        value={quantity.children}
        onChange={(v) => setQuantity({ ...quantity, children: Number(v || 0) })}
        error={errors.children}
      />
      <NumberField
        label="Infants (30%)"
        min={0}
        value={quantity.infants}
        onChange={(v) => setQuantity({ ...quantity, infants: Number(v || 0) })}
        error={errors.infants}
      />

      <div className="border-t border-neutral-200 mt-4 pt-4 text-sm space-y-2">
        <p className="text-neutral-700">
          Total Guests:{" "}
          <b className="text-neutral-900">{totalPeople} person(s)</b>
        </p>
        <p className="text-neutral-700">
          Available Seats:{" "}
          <b className={availableSeats < totalPeople ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
            {availableSeats}
          </b>
          {availableSeats < totalPeople && (
            <span className="text-xs text-red-600 ml-2">⚠️ Not enough seats</span>
          )}
        </p>
        {errors.total && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">
            {errors.total}
          </p>
        )}
        <p className="text-neutral-700">
          Total Amount:{" "}
          <span className="text-xl font-bold text-primary-600">
            {totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
          </span>
        </p>
      </div>
    </div>
  );
}

