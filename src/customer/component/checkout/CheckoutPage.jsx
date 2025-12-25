import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createCustomerInfo, createBookingTour } from "../../../services/customer/bookingService";
import { getCurrentUser } from "../../../services/common/authService";
import { processTourPayment as processPayPalPayment } from "../../../services/customer/paypalPaymentService";
import { processTourPayment as processMomoPayment } from "../../../services/customer/momoPaymentService";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import CheckoutHeader from "./CheckoutHeader";
import CustomerInfoForm from "./CustomerInfoForm";
import GuestsSelector from "./GuestsSelector";
import PaymentMethodSelector from "./PaymentMethodSelector";
import RefundPolicy from "./RefundPolicy";
import OrderSummary from "./OrderSummary";

export default function CheckoutPage() {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Try to get state from location, if not available, try sessionStorage (from login redirect)
    const [checkoutData] = useState(() => {
        if (state?.tour && state?.details) {
            return state;
        }
        // Try to load from sessionStorage (saved when redirecting to login)
        try {
            const saved = sessionStorage.getItem('checkoutState');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Clear sessionStorage after using
                sessionStorage.removeItem('checkoutState');
                return parsed;
            }
        } catch (e) {
            console.error('Error loading checkout state from sessionStorage:', e);
        }
        return null;
    });

    const tour = checkoutData?.tour;
    const details = checkoutData?.details;

    // Get current user info for default values
    const currentUser = getCurrentUser();

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    
    // Initialize form with user data if available
    const [form, setForm] = useState({
        CustomerName: currentUser?.fullName || currentUser?.FullName || "",
        CustomerCitizenCard: "",
        CustomerPhone: currentUser?.phone || currentUser?.Phone || "",
        CustomerEmail: currentUser?.email || currentUser?.Email || "",
        CapacityAdult: 1,
        CapacityKid: 0,
        CapacityBaby: 0,
        PaymentMethod: "COD", // COD, MOMO, PAYPAL
        OrderNote: "",
    });

    if (!tour || !details) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tour information...</p>
                </div>
            </div>
        );
    }

    const availableSeats = details.NumberOfGuests - (details.BookedSeat || 0);

    const orderTotal =
        form.CapacityAdult * details.UnitPrice +
        form.CapacityKid * details.UnitPrice * 0.7 +
        form.CapacityBaby * details.UnitPrice * 0.3;

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: "", TotalGuests: "" }));
    }

    function handleBlur(field, error) {
        if (error) {
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    }

    // Enhanced validators with detailed error messages in English
    const validators = {
        CustomerName: (v) => {
            if (!v || !v.trim()) {
                return "Full name is required. Please enter your full name.";
            }
            if (v.trim().split(" ").filter(w => w.length > 0).length < 2) {
                return "Full name must contain at least 2 words. Example: 'John Smith'.";
            }
            if (/[0-9]/.test(v)) {
                return "Full name cannot contain numbers. Please enter letters only.";
            }
            if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v)) {
                return "Full name cannot contain special characters. Please enter letters and spaces only.";
            }
            if (v.trim().length < 3) {
                return "Full name is too short. Please enter at least 3 characters.";
            }
            if (v.trim().length > 100) {
                return "Full name is too long. Please enter a maximum of 100 characters.";
            }
            return "";
        },

        CustomerEmail: (v) => {
            if (!v || !v.trim()) {
                return "Email is required. Please enter your email address.";
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(v)) {
                return "Invalid email format. Please enter a valid email address, e.g., example@email.com";
            }
            if (v.length > 255) {
                return "Email is too long. Please enter an email with a maximum of 255 characters.";
            }
            return "";
        },

        CustomerPhone: (v) => {
            if (!v || !v.trim()) {
                return "Phone number is required. Please enter your phone number.";
            }
            const phoneTrimmed = v.trim();
            let phoneToCheck = phoneTrimmed.replace(/\s/g, "").replace(/[+()-]/g, "");
            
            // Vietnam standard: 10 digits, starts with 0, second digit is 3, 5, 7, 8, or 9
            // Or can start with +84 or 84
            if (phoneTrimmed.startsWith("+84")) {
                // If starts with +84, remove +84 and add 0
                phoneToCheck = "0" + phoneToCheck.substring(2);
            } else if (phoneToCheck.startsWith("84") && phoneToCheck.length === 11) {
                // If starts with 84 and has 11 digits, remove 84 and add 0
                phoneToCheck = "0" + phoneToCheck.substring(2);
            }
            
            // Vietnam phone number: 0[3|5|7|8|9][0-9]{8}
            const phoneRegex = /^0[35789][0-9]{8}$/;
            if (!phoneRegex.test(phoneToCheck)) {
                return "Invalid phone number. Please enter a 10-digit phone number starting with 0, second digit must be 3, 5, 7, 8, or 9 (e.g., 0912345678).";
            }
            return "";
        },

        CustomerCitizenCard: (v) => {
            if (!v || !v.trim()) {
                return "ID Card (CCCD/CMND) is required. Please enter your ID card number.";
            }
            const cardCleaned = v.replace(/\s/g, "");
            
            // Vietnam standard: 9 digits (old CMND) or 12 digits (new CCCD)
            const cardRegex = /^[0-9]{9}$|^[0-9]{12}$/;
            if (!cardRegex.test(cardCleaned)) {
                return "Invalid ID card number. Please enter 9 digits (CMND) or 12 digits (CCCD).";
            }
            return "";
        },

        CapacityAdult: (v) => {
            if (!v || v < 1) {
                return "At least 1 adult is required. Please select at least 1 adult.";
            }
            if (v > 50) {
                return "Number of adults is too large. Please contact us directly to book tours for large groups.";
            }
            return "";
        },

        PaymentMethod: (v) => {
            if (!v) {
                return "Please select a payment method.";
            }
            return "";
        },
    };

    function validateForm() {
        let newErrors = {};

        Object.keys(validators).forEach((field) => {
            const error = validators[field](form[field]);
            if (error) newErrors[field] = error;
        });

        const totalGuests =
            form.CapacityAdult + form.CapacityKid + form.CapacityBaby;

        if (totalGuests > availableSeats) {
            newErrors.TotalGuests = `Not enough available seats. Currently only ${availableSeats} seats available, but you selected ${totalGuests} guests. Please reduce the number of guests or choose another tour.`;
        }

        if (totalGuests < 1) {
            newErrors.TotalGuests = "Please select at least 1 guest.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // Map payment method to backend format
    const getPaymentMethodString = (method) => {
        const map = {
            "COD": "COD",
            "MOMO": "MOMO",
            "PAYPAL": "PAYPAL"
        };
        return map[method] || "COD";
    };

    async function handleSubmit() {
        if (!validateForm()) {
            // Scroll to first error
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const element = document.querySelector(`[name="${firstErrorField}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                    element.focus();
                }
            }
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            // Get AccountID from logged-in user
            const accountID = currentUser?.accountID || currentUser?.AccountID || 1;

            // Step 1: Create CustomerInfo
            // Format phone number (remove +84 prefix if exists, ensure starts with 0)
            const phoneTrimmed = form.CustomerPhone.trim();
            let phoneNumber = phoneTrimmed.replace(/\s/g, "").replace(/[+()-]/g, "");
            if (phoneTrimmed.startsWith("+84")) {
                phoneNumber = "0" + phoneNumber.substring(2);
            } else if (phoneNumber.startsWith("84") && phoneNumber.length === 11) {
                phoneNumber = "0" + phoneNumber.substring(2);
            }

            const customerInfoData = {
                customerName: form.CustomerName.trim(),
                customerPhone: phoneNumber,
                customerEmail: form.CustomerEmail.trim(),
                citizenCard: form.CustomerCitizenCard?.trim().replace(/\s/g, "") || null,
            };

            const customerInfo = await createCustomerInfo(customerInfoData);
            const customerInfoID = customerInfo.customerInfoID;

            // Step 2: Create BookingTour
            // For COD: expire in 24 hours, for others: expire in 7 days
            const expireHours = form.PaymentMethod === "COD" ? 24 : 168;
            const expireAt = new Date(Date.now() + expireHours * 60 * 60 * 1000);
            const orderCode = "ORD" + Date.now();

            const bookingData = {
                accountID: accountID,
                customerInfoID: customerInfoID,
                tourDetailID: details.TourDetailID,
                adultCount: form.CapacityAdult,
                childCount: form.CapacityKid || 0,
                infantCount: form.CapacityBaby || 0,
                unitPrice: details.UnitPrice,
                orderTotal: orderTotal,
                paymentMethod: getPaymentMethodString(form.PaymentMethod),
                paymentStatus: 0, // 0 = Pending
                orderStatus: 1, // 1 = Processing
                orderCode: orderCode,
                expireAt: expireAt.toISOString(),
            };

            const booking = await createBookingTour(bookingData);

            // Step 3: Prepare payload for BookingSuccessPage
            const payload = {
                ...booking,
                CapacityAdult: booking.adultCount,
                CapacityKid: booking.childCount || 0,
                CapacityBaby: booking.infantCount || 0,
                OrderTotal: booking.orderTotal,
                OrderCode: booking.orderCode,
                PaymentMethod: form.PaymentMethod,
                CustomerName: form.CustomerName,
                CustomerPhone: form.CustomerPhone,
                CustomerEmail: form.CustomerEmail,
                CustomerCitizenCard: form.CustomerCitizenCard,
            };

            // Step 4: Handle payment based on payment method
            if (form.PaymentMethod === "PAYPAL") {
                try {
                    // Process PayPal payment (amount is already in USD)
                    const amountInUSD = parseFloat(booking.orderTotal.toFixed(2));

                    // Process PayPal payment
                    const approvalUrl = await processPayPalPayment(
                        {
                            orderCode: booking.orderCode,
                            orderTotal: amountInUSD,
                        },
                        "USD"
                    );

                    // Redirect to PayPal
                    window.location.href = approvalUrl;
                    return; // Don't navigate to success page yet, wait for PayPal return
                } catch (paypalError) {
                    console.error("PayPal payment error:", paypalError);
                    setSubmitError(
                        paypalError.message || 
                        "Failed to initialize PayPal payment. Please try again or choose another payment method."
                    );
                    setIsSubmitting(false);
                    return;
                }
            } else if (form.PaymentMethod === "MOMO") {
                try {
                    // Process MoMo payment (amount is in USD)
                    const payUrl = await processMomoPayment({
                        orderCode: booking.orderCode,
                        orderTotal: booking.orderTotal,
                    });

                    // Redirect to MoMo
                    window.location.href = payUrl;
                    return; // Don't navigate to success page yet, wait for MoMo return
                } catch (momoError) {
                    console.error("MoMo payment error:", momoError);
                    setSubmitError(
                        momoError.message || 
                        "Failed to initialize MoMo payment. Please try again or choose another payment method."
                    );
                    setIsSubmitting(false);
                    return;
                }
            }

            // Step 5: Navigate to success page (for COD only)
            navigate("/booking-success", {
                state: {
                    payload: payload,
                    booking: payload,
                    tour: tour,
                    details: details,
                },
            });
        } catch (error) {
            console.error("Booking error:", error);
            setSubmitError(error.response?.data?.message || error.message || "An error occurred while creating the booking. Please try again or contact support!");
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 lg:px-6">
                
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </button>
                
                {/* Header: Tour Info & Dates */}
                <CheckoutHeader tour={tour} details={details} />

                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Left Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <CustomerInfoForm
                            form={form}
                            errors={errors}
                            validators={validators}
                            onUpdate={update}
                            onBlur={handleBlur}
                        />

                        {/* Guests */}
                        <GuestsSelector
                            form={form}
                            errors={errors}
                            availableSeats={availableSeats}
                            onUpdate={update}
                        />

                        {/* Payment Method */}
                        <PaymentMethodSelector
                            form={form}
                            errors={errors}
                            onUpdate={update}
                        />

                        {/* Refund Policy */}
                        <RefundPolicy />

                        {/* Error Message */}
                        {submitError && (
                            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                                <p className="text-red-700 font-medium mb-1">⚠️ Error booking tour</p>
                                <p className="text-red-600 text-sm">{submitError}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                                isSubmitting
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl"
                            }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processing...
                                </span>
                            ) : (
                                "Confirm Booking"
                            )}
                        </button>
                    </div>

                    {/* Right Summary */}
                    <aside className="lg:sticky lg:top-24 h-fit">
                        <OrderSummary
                            tour={tour}
                            details={details}
                            form={form}
                            orderTotal={orderTotal}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
}

