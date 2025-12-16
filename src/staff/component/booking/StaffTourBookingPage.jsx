import React, { useEffect, useMemo, useState } from "react";
import { searchTours, getTourById } from "../../../services/staff/tourStaffService";
import { createCustomerInfo } from "../../../services/staff/customerStaffService";
import { createBooking } from "../../../services/staff/bookingStaffService";
import { getCurrentUser } from "../../../services/common/authService";
import { toast } from "../../shared/toast/toast";
import TourInfoCard from "./components/TourInfoCard";
import CustomerInfoForm from "./components/CustomerInfoForm";
import QuantitySelector from "./components/QuantitySelector";

// Helper to convert relative image URL to absolute
const toAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  return `${baseUrl}${url}`;
};

// ========================
// MAIN PAGE
// ========================
export default function StaffTourBookingPage() {
  const [step, setStep] = useState("list"); // 'list' | 'booking'
  const [selectedTour, setSelectedTour] = useState(null);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto p-6">
        {step === "list" && (
          <TourSelectSection
            onSelect={(tour) => {
              setSelectedTour(tour);
              setStep("booking");
            }}
          />
        )}

        {step === "booking" && (
          <BookingSection
            tour={selectedTour}
            onBack={() => {
              setStep("list");
              setSelectedTour(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ========================
// 1) TOUR SELECT (CARD LIST)
// ========================
function TourSelectSection({ onSelect }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 6;

  useEffect(() => {
    fetchTours();
  }, [page, search]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const response = await searchTours({
        page,
        size: pageSize,
        keyword: search || undefined,
        status: 1, // Only active tours
      });
      setTours(response.items || []);
      setTotalPages(response.totalPages || 0);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Error fetching tours:", error);
      toast.error(error.message || "Failed to load tours");
    } finally {
      setLoading(false);
    }
  };

  const filteredTours = useMemo(() => {
    return tours;
  }, [tours]);

  return (
    <>
      {/* SEARCH BAR */}
      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <input
          className="border border-neutral-200 px-4 py-2.5 rounded-lg w-full md:w-80 shadow-sm bg-white text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          placeholder="Tìm theo tên tour / mã tour / điểm khởi hành..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </div>

      {/* CARD GRID */}
      {loading ? (
        <div className="text-center text-neutral-500 mt-10 font-medium">
          Loading tours...
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="text-center text-neutral-500 mt-10 font-medium">
          No tours found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTours.map((tour) => {
            const details = tour.details || [];
            const minPrice = details.length > 0
              ? Math.min(...details.map((d) => parseFloat(d.unitPrice || 0)))
              : 0;
            return (
              <div
                key={tour.tourID}
                className="bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                <div className="h-36 w-full overflow-hidden">
                  <img
                    src={toAbsoluteUrl(tour.tourImg) || "https://via.placeholder.com/400x200"}
                    alt={tour.tourName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x200";
                    }}
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-xs text-neutral-500 mb-1 font-medium">
                    {tour.tourCode}
                  </div>
                  <h3 className="font-bold text-base line-clamp-2 text-neutral-900">
                    {tour.tourName}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1">
                    Starting: {tour.startingLocation}
                  </p>
                  <p className="text-xs text-neutral-600">
                    Duration: {tour.duration}
                  </p>

                  <p className="text-sm font-bold text-primary-600 mt-3">
                    Price: ${minPrice.toLocaleString()}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                    <span>
                      {details.length} departure date(s) available
                    </span>
                  </div>

                  <button
                    onClick={() => onSelect(tour)}
                    className="mt-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-2.5 rounded-lg text-sm w-full font-semibold shadow-md transition"
                  >
                    Select This Tour
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center gap-3 mt-6 items-center">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0 || loading}
          className="px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-700 disabled:opacity-40 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition font-medium"
        >
          ⬅ Previous
        </button>
        <span className="text-sm text-neutral-700 font-medium">
          Page {page + 1} / {totalPages || 1} ({total} total)
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page + 1 >= totalPages || loading}
          className="px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-700 disabled:opacity-40 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition font-medium"
        >
          Next ➝
        </button>
      </div>
    </>
  );
}

// ========================
// 2) BOOKING SECTION
// ========================
function BookingSection({ tour, onBack }) {
  const [tourDetails, setTourDetails] = useState(null);
  const [loadingTour, setLoadingTour] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    citizenCard: "",
    paymentMethod: "CASH",
    note: "",
  });

  const [quantity, setQuantity] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tour?.tourID) {
      fetchTourDetails();
    }
  }, [tour]);

  const fetchTourDetails = async () => {
    setLoadingTour(true);
    try {
      const response = await getTourById(tour.tourID);
      setTourDetails(response);
      if (response.details && response.details.length > 0) {
        setSelectedDetail(response.details[0]);
      }
    } catch (error) {
      console.error("Error fetching tour details:", error);
      toast.error(error.message || "Failed to load tour details");
    } finally {
      setLoadingTour(false);
    }
  };

  if (!tour) return null;

  const unitPrice = selectedDetail ? parseFloat(selectedDetail.unitPrice || 0) : 0;

  const totalPrice =
    quantity.adults * unitPrice +
    quantity.children * unitPrice * 0.7 +
    quantity.infants * unitPrice * 0.3;

  const availableSeats = selectedDetail
    ? (selectedDetail.numberOfGuests || 0) - (selectedDetail.bookedSeat || 0)
    : 0;

  const totalPeople =
    quantity.adults + quantity.children + quantity.infants;

  // Validation functions
  const validateCustomer = () => {
    const newErrors = {};

    if (!customer.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (customer.name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters";
    }

    if (!customer.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      // const phoneRegex = /^[\d\s\+\-\(\)]{8,15}$/;
      // if (!phoneRegex.test(customer.phone.trim())) {
      //   newErrors.phone = "Please enter a valid phone number (8-15 digits)";
      // }
    }

    if (customer.email && customer.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customer.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (customer.citizenCard && customer.citizenCard.trim()) {
      // Basic validation for citizen card (alphanumeric, 8-20 characters)
      const citizenCardRegex = /^[A-Za-z0-9]{8,20}$/;
      if (!citizenCardRegex.test(customer.citizenCard.trim())) {
        newErrors.citizenCard = "Citizen card must be 8-20 alphanumeric characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateQuantity = () => {
    const newErrors = {};

    if (quantity.adults < 1) {
      newErrors.adults = "At least 1 adult is required";
    }

    if (quantity.children < 0) {
      newErrors.children = "Number of children cannot be negative";
    }

    if (quantity.infants < 0) {
      newErrors.infants = "Number of infants cannot be negative";
    }

    if (totalPeople > availableSeats) {
      newErrors.total = `Only ${availableSeats} seats available, cannot book ${totalPeople} guests`;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Generate order code
  const generateOrderCode = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  };

  const handleCreateBooking = async () => {
    setError("");
    setErrors({});

    // Validate all fields
    if (!selectedDetail) {
      setError("Please select a departure date");
      return;
    }

    if (!validateCustomer()) {
      setError("Please fix the errors in customer information");
      return;
    }

    // Re-validate quantity with current available seats
    if (!validateQuantity()) {
      setError("Please fix the errors in quantity selection");
      return;
    }

    // Double-check available seats before submitting
    if (totalPeople > availableSeats) {
      setError(
        `Not enough available seats. Only ${availableSeats} seat(s) available, but trying to book ${totalPeople} guest(s). Please refresh the page to see the latest availability.`
      );
      return;
    }

    if (totalPeople <= 0) {
      setError("Number of guests must be greater than 0");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.accountID) {
      setError("Staff account not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const customerInfo = await createCustomerInfo({
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        customerEmail: customer.email.trim() || null,
        citizenCard: customer.citizenCard.trim() || null,
      });

      const paymentStatus = 1; // Always paid when staff creates booking
      const orderStatus = 1; // CONFIRMED

      const orderCode = generateOrderCode();

      const expireAt = new Date();
      expireAt.setFullYear(expireAt.getFullYear() + 1);

      const bookingData = {
        accountID: currentUser.accountID,
        customerInfoID: customerInfo.customerInfoID,
        tourDetailID: selectedDetail.tourDetailID,
        adultCount: quantity.adults,
        childCount: quantity.children || 0,
        infantCount: quantity.infants || 0,
        unitPrice: unitPrice,
        orderTotal: totalPrice,
        paymentMethod: customer.paymentMethod,
        paymentStatus: paymentStatus,
        orderStatus: orderStatus,
        orderCode: orderCode,
        expireAt: expireAt.toISOString(),
      };

      await createBooking(bookingData);

      toast.success("Booking created successfully! Seats have been reserved.");

      // Refresh tour details to get updated bookedSeat
      await fetchTourDetails();

      // Reset form
      setCustomer({
        name: "",
        phone: "",
        email: "",
        citizenCard: "",
        paymentMethod: "CASH",
        note: "",
      });
      setQuantity({ adults: 1, children: 0, infants: 0 });
      setErrors({});
      setError("");

      // Go back to list after success
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error("Error creating booking:", error);
      setError(error.message || "Failed to create booking");
      toast.error(error.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-sm text-primary-600 hover:text-primary-700 mb-3 font-medium transition"
          >
            ← Back to Tour List
          </button>

          <p className="text-sm text-neutral-600 mt-1">
            Enter customer information, quantity, and confirm booking details.
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TourInfoCard
          tour={tour}
          tourDetails={tourDetails}
          selectedDetail={selectedDetail}
          onSelectDetail={setSelectedDetail}
          loadingTour={loadingTour}
          availableSeats={availableSeats}
        />

        <CustomerInfoForm
          customer={customer}
          setCustomer={setCustomer}
          errors={errors}
        />

        <QuantitySelector
          quantity={quantity}
          setQuantity={setQuantity}
          unitPrice={unitPrice}
          availableSeats={availableSeats}
          errors={errors}
        />
      </div>

      {/* Error Message & Submit Button */}
      <div className="mt-6 bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleCreateBooking}
          disabled={loading || loadingTour || !selectedDetail}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-3 rounded-lg text-sm font-bold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating Booking...
            </span>
          ) : (
            " CREATE BOOKING"
          )}
        </button>
      </div>
    </div>
  );
}

