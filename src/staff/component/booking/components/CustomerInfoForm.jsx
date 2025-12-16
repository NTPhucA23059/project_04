import React, { useState } from "react";

function Field({ label, value, onChange, type = "text", required = false, error }) {
  return (
    <div className="mb-3">
      <label className="text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
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

export default function CustomerInfoForm({ customer, setCustomer, errors = {} }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
      <h3 className="font-bold text-neutral-900 mb-4 border-b border-primary-200 pb-2">
        2. Customer Information
      </h3>

      <Field
        label="Full Name"
        value={customer.name}
        onChange={(v) => setCustomer({ ...customer, name: v })}
        required
        error={errors.name}
      />
      <Field
        label="Phone Number"
        value={customer.phone}
        onChange={(v) => setCustomer({ ...customer, phone: v })}
        type="tel"
        required
        error={errors.phone}
      />
      <Field
        label="Email"
        value={customer.email}
        onChange={(v) => setCustomer({ ...customer, email: v })}
        type="email"
        error={errors.email}
      />
      <Field
        label="Citizen Card / Passport"
        value={customer.citizenCard}
        onChange={(v) => setCustomer({ ...customer, citizenCard: v })}
        error={errors.citizenCard}
      />

      <label className="text-sm font-medium text-neutral-700 mt-3 block">
        Payment Method <span className="text-red-500">*</span>
      </label>
      <select
        className="border border-neutral-200 px-3 py-2 rounded-lg w-full mt-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition bg-white"
        value={customer.paymentMethod || "CASH"}
        onChange={(e) => setCustomer({ ...customer, paymentMethod: e.target.value })}
      >
        <option value="CASH">Cash (Paid at Office)</option>
        <option value="TRANSFER">Bank Transfer (Paid at Office)</option>
        <option value="MOMO">MoMo (Online Payment)</option>
        <option value="VNPAY">VNPay (Online Payment)</option>
      </select>
      <p className="text-xs text-neutral-500 mt-1">
        Note: All payment methods are considered as paid when booking is created by staff.
      </p>

      <label className="text-sm font-medium text-neutral-700 mt-3 block">
        Internal Note
      </label>
      <textarea
        className="border border-neutral-200 px-3 py-2 rounded-lg w-full mt-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
        rows={3}
        value={customer.note || ""}
        onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
        placeholder="E.g., Customer requests double bed, vegetarian meal, needs pickup service..."
      />
    </div>
  );
}

