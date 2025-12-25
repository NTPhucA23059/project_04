import { UserIcon, PhoneIcon, EnvelopeIcon, IdentificationIcon } from "@heroicons/react/24/outline";

export default function CustomerInfoForm({ form, errors, validators, onUpdate, onBlur }) {
    const inputBaseStyle = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200";
    const inputNormalStyle = `${inputBaseStyle} border-gray-300 focus:border-primary-500 focus:ring-primary-200`;
    const inputErrorStyle = `${inputBaseStyle} border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50`;

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-primary-600" />
                Customer Information
            </h2>

            <div className="space-y-4">
                {/* Full Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            name="CustomerName"
                            type="text"
                            className={`${errors.CustomerName ? inputErrorStyle : inputNormalStyle} pl-10`}
                            placeholder="Enter your full name"
                            value={form.CustomerName}
                            onChange={(e) => onUpdate("CustomerName", e.target.value)}
                            onBlur={() => {
                                const error = validators.CustomerName(form.CustomerName);
                                if (error) onBlur("CustomerName", error);
                            }}
                        />
                    </div>
                    {errors.CustomerName && (
                        <p className="text-red-600 text-sm mt-1.5 flex items-start gap-1">
                            <span>⚠</span>
                            <span>{errors.CustomerName}</span>
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            name="CustomerEmail"
                            type="email"
                            className={`${errors.CustomerEmail ? inputErrorStyle : inputNormalStyle} pl-10`}
                            placeholder="example@email.com"
                            value={form.CustomerEmail}
                            onChange={(e) => onUpdate("CustomerEmail", e.target.value)}
                            onBlur={() => {
                                const error = validators.CustomerEmail(form.CustomerEmail);
                                if (error) onBlur("CustomerEmail", error);
                            }}
                        />
                    </div>
                    {errors.CustomerEmail && (
                        <p className="text-red-600 text-sm mt-1.5 flex items-start gap-1">
                            <span>⚠</span>
                            <span>{errors.CustomerEmail}</span>
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            name="CustomerPhone"
                            type="tel"
                            className={`${errors.CustomerPhone ? inputErrorStyle : inputNormalStyle} pl-10`}
                            placeholder="0123456789"
                            value={form.CustomerPhone}
                            onChange={(e) => onUpdate("CustomerPhone", e.target.value.replace(/\D/g, ""))}
                            onBlur={() => {
                                const error = validators.CustomerPhone(form.CustomerPhone);
                                if (error) onBlur("CustomerPhone", error);
                            }}
                        />
                    </div>
                    {errors.CustomerPhone && (
                        <p className="text-red-600 text-sm mt-1.5 flex items-start gap-1">
                            <span>⚠</span>
                            <span>{errors.CustomerPhone}</span>
                        </p>
                    )}
                </div>

                {/* Citizen Card */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Card (CCCD/CMND) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            name="CustomerCitizenCard"
                            type="text"
                            className={`${errors.CustomerCitizenCard ? inputErrorStyle : inputNormalStyle} pl-10`}
                            placeholder="9 số (CMND) hoặc 12 số (CCCD)"
                            value={form.CustomerCitizenCard}
                            onChange={(e) => onUpdate("CustomerCitizenCard", e.target.value.replace(/\D/g, ""))}
                            onBlur={() => {
                                const error = validators.CustomerCitizenCard(form.CustomerCitizenCard);
                                if (error) onBlur("CustomerCitizenCard", error);
                            }}
                        />
                    </div>
                    {errors.CustomerCitizenCard && (
                        <p className="text-red-600 text-sm mt-1.5 flex items-start gap-1">
                            <span>⚠</span>
                            <span>{errors.CustomerCitizenCard}</span>
                        </p>
                    )}
                </div>

                {/* Note */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <textarea
                        className={inputNormalStyle}
                        rows="3"
                        placeholder="Additional notes about special requirements, food allergies, etc..."
                        value={form.OrderNote}
                        onChange={(e) => onUpdate("OrderNote", e.target.value)}
                    />
                </div>
            </div>
        </section>
    );
}

