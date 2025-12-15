import React, { useMemo, useState } from "react";

// ========================
// FAKE DATA (mảng tour)
// ========================
const fakeTours = [
  {
    tourID: 1,
    tourCode: "DN-3N2D",
    tourName: "Đà Nẵng – Hội An 3N2D",
    tourImg:
      "https://images.pexels.com/photos/2563129/pexels-photo-2563129.jpeg?auto=compress&cs=tinysrgb&w=1200",
    startingLocation: "TP. Hồ Chí Minh",
    duration: "3N2D",
    status: 1,
    categoryID: 2,
    detailOptions: [
      {
        tourDetailID: 101,
        departureDate: "2025-12-20",
        unitPrice: 3500000,
        numberOfGuests: 30,
        bookedSeat: 10,
      },
      {
        tourDetailID: 102,
        departureDate: "2025-12-25",
        unitPrice: 3800000,
        numberOfGuests: 30,
        bookedSeat: 5,
      },
    ],
  },
  {
    tourID: 2,
    tourCode: "PQ-4N3D",
    tourName: "Phú Quốc Resort 4N3D",
    tourImg:
      "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200",
    startingLocation: "Hà Nội",
    duration: "4N3D",
    status: 1,
    categoryID: 3,
    detailOptions: [
      {
        tourDetailID: 201,
        departureDate: "2025-12-22",
        unitPrice: 5500000,
        numberOfGuests: 20,
        bookedSeat: 12,
      },
    ],
  },
  {
    tourID: 3,
    tourCode: "DL-2N1D",
    tourName: "Đà Lạt Chill 2N1D",
    tourImg:
      "https://images.pexels.com/photos/208745/pexels-photo-208745.jpeg?auto=compress&cs=tinysrgb&w=1200",
    startingLocation: "TP. Hồ Chí Minh",
    duration: "2N1D",
    status: 1,
    categoryID: 1,
    detailOptions: [
      {
        tourDetailID: 301,
        departureDate: "2025-12-18",
        unitPrice: 2500000,
        numberOfGuests: 25,
        bookedSeat: 8,
      },
    ],
  },
];

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
  const pageSize = 6;

  const filteredTours = useMemo(() => {
    const kw = search.toLowerCase().trim();
    return fakeTours.filter(
      (t) =>
        t.tourName.toLowerCase().includes(kw) ||
        t.tourCode.toLowerCase().includes(kw) ||
        t.startingLocation.toLowerCase().includes(kw)
    );
  }, [search]);

  const totalPages = Math.ceil(filteredTours.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages - 1);
  const pagedTours = filteredTours.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            📜 Chọn Tour để Đặt Giúp Khách
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            Nhân viên chọn tour & ngày khởi hành phù hợp cho khách gọi điện.
          </p>
        </div>
      </div>

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
      {pagedTours.length === 0 ? (
        <div className="text-center text-neutral-500 mt-10 font-medium">
          Không tìm thấy tour nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pagedTours.map((tour) => {
            const minPrice = Math.min(
              ...tour.detailOptions.map((d) => d.unitPrice)
            );
            return (
              <div
                key={tour.tourID}
                className="bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                <div className="h-36 w-full overflow-hidden">
                  <img
                    src={tour.tourImg}
                    alt={tour.tourName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
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
                    Khởi hành từ: {tour.startingLocation}
                  </p>
                  <p className="text-xs text-neutral-600">
                    Thời lượng: {tour.duration}
                  </p>

                  <p className="text-sm font-bold text-primary-600 mt-3">
                    Giá từ {minPrice.toLocaleString()} đ
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                    <span>
                      {tour.detailOptions.length} đợt khởi hành sắp tới
                    </span>
                  </div>

                  <button
                    onClick={() => onSelect(tour)}
                    className="mt-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-2.5 rounded-lg text-sm w-full font-semibold shadow-md transition"
                  >
                    Chọn tour này
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
          disabled={currentPage === 0}
          className="px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-700 disabled:opacity-40 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition font-medium"
        >
          ⬅ Trước
        </button>
        <span className="text-sm text-neutral-700 font-medium">
          Trang {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() =>
            setPage((p) => (p + 1 < totalPages ? p + 1 : p))
          }
          disabled={currentPage + 1 >= totalPages}
          className="px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-700 disabled:opacity-40 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition font-medium"
        >
          Sau ➝
        </button>
      </div>
    </>
  );
}

// ========================
// 2) BOOKING SECTION
// ========================
function BookingSection({ tour, onBack }) {
  const [selectedDetail, setSelectedDetail] = useState(
    tour.detailOptions[0] || null
  );

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    citizenCard: "",
  });

  const [quantity, setQuantity] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  if (!tour) return null;

  const unitPrice = selectedDetail?.unitPrice || 0;

  const totalPrice =
    quantity.adults * unitPrice +
    quantity.children * unitPrice * 0.7 +
    quantity.infants * unitPrice * 0.3;

  const availableSeats = selectedDetail
    ? selectedDetail.numberOfGuests - selectedDetail.bookedSeat
    : 0;

  const totalPeople =
    quantity.adults + quantity.children + quantity.infants;

  const handleCreateBooking = () => {
    setError("");

    if (!selectedDetail) {
      setError("Vui lòng chọn ngày khởi hành");
      return;
    }
    if (!customer.name.trim() || !customer.phone.trim()) {
      setError("Vui lòng nhập họ tên và số điện thoại khách hàng");
      return;
    }
    if (totalPeople <= 0) {
      setError("Số lượng khách phải lớn hơn 0");
      return;
    }
    if (totalPeople > availableSeats) {
      setError(
        `Số chỗ còn lại chỉ còn ${availableSeats}, không thể đặt ${totalPeople} khách`
      );
      return;
    }

    const payload = {
      tourID: tour.tourID,
      tourDetailID: selectedDetail.tourDetailID,
      customer,
      quantity,
      paymentMethod,
      note,
      totalPrice,
    };

    console.log("FAKE BOOKING PAYLOAD:", payload);
    alert(
      "Tạo booking (fake) thành công!\nXem chi tiết trong console của trình duyệt."
    );
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
            ← Quay lại chọn tour
          </button>
          <h2 className="text-2xl font-bold text-neutral-900">
            📞 Đặt Tour Giúp Khách – {tour.tourName}
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Nhập thông tin khách, số lượng và xác nhận giá trị booking.
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COL 1: TOUR & NGÀY KHỞI HÀNH */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-neutral-900 mb-4 border-b border-primary-200 pb-2">1. Thông tin tour</h3>

          <div className="flex gap-3 mb-4">
            <img
              src={tour.tourImg}
              alt={tour.tourName}
              className="w-20 h-20 object-cover rounded-lg border border-neutral-200"
            />
            <div className="text-sm">
              <div className="font-bold text-neutral-900">{tour.tourName}</div>
              <div className="text-xs text-neutral-600 mt-1">
                Mã tour: {tour.tourCode}
              </div>
              <div className="text-xs text-neutral-600">
                Khởi hành từ: {tour.startingLocation}
              </div>
              <div className="text-xs text-neutral-600">
                Thời lượng: {tour.duration}
              </div>
            </div>
          </div>

          <label className="text-sm font-medium text-neutral-700">
            Chọn ngày khởi hành
          </label>
          <select
            className="border border-neutral-200 px-3 py-2 rounded-lg w-full mt-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition bg-white"
            value={selectedDetail?.tourDetailID || ""}
            onChange={(e) => {
              const d = tour.detailOptions.find(
                (x) => x.tourDetailID === Number(e.target.value)
              );
              setSelectedDetail(d || null);
            }}
          >
            <option value="">-- Chọn ngày --</option>
            {tour.detailOptions.map((d) => (
              <option key={d.tourDetailID} value={d.tourDetailID}>
                {new Date(d.departureDate).toLocaleDateString("vi-VN")} –{" "}
                {d.unitPrice.toLocaleString()} đ
              </option>
            ))}
          </select>

          {selectedDetail && (
            <div className="mt-3 bg-primary-50 border border-primary-200 rounded-lg p-3 text-xs">
              <p className="text-neutral-700">
                <b className="text-neutral-900">Ngày khởi hành:</b>{" "}
                {new Date(
                  selectedDetail.departureDate
                ).toLocaleDateString("vi-VN")}
              </p>
              <p className="text-neutral-700">
                <b className="text-neutral-900">Số chỗ:</b> {selectedDetail.bookedSeat}/
                {selectedDetail.numberOfGuests} –{" "}
                <span className="text-primary-600 font-bold">
                  Còn {availableSeats} chỗ
                </span>
              </p>
              <p className="text-neutral-700">
                <b className="text-neutral-900">Giá người lớn:</b>{" "}
                {selectedDetail.unitPrice.toLocaleString()} đ
              </p>
              <p className="text-neutral-700">
                <b className="text-neutral-900">Trẻ em:</b> 70% giá người lớn / <b className="text-neutral-900">Em bé:</b> 30%
              </p>
            </div>
          )}
        </div>

        {/* COL 2: CUSTOMER INFO */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-neutral-900 mb-4 border-b border-primary-200 pb-2">2. Thông tin khách hàng</h3>

          <Field
            label="Họ tên"
            value={customer.name}
            onChange={(v) => setCustomer({ ...customer, name: v })}
          />
          <Field
            label="Số điện thoại"
            value={customer.phone}
            onChange={(v) => setCustomer({ ...customer, phone: v })}
          />
          <Field
            label="Email"
            value={customer.email}
            onChange={(v) => setCustomer({ ...customer, email: v })}
          />
          <Field
            label="CCCD / Passport"
            value={customer.citizenCard}
            onChange={(v) => setCustomer({ ...customer, citizenCard: v })}
          />

          <label className="text-sm font-medium text-neutral-700 mt-3 block">
            Phương thức thanh toán
          </label>
          <select
            className="border border-neutral-200 px-3 py-2 rounded-lg w-full mt-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition bg-white"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="CASH">Tiền mặt</option>
            <option value="TRANSFER">Chuyển khoản</option>
            <option value="MOMO">Momo</option>
            <option value="VNPAY">VNPay</option>
          </select>

          <label className="text-sm font-medium text-neutral-700 mt-3 block">
            Ghi chú nội bộ
          </label>
          <textarea
            className="border border-neutral-200 px-3 py-2 rounded-lg w-full mt-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: Khách yêu cầu giường đôi, ăn chay, cần xe đón tận nhà..."
          />
        </div>

        {/* COL 3: QUANTITY + TOTAL */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-neutral-900 mb-4 border-b border-primary-200 pb-2">3. Số lượng & Tổng tiền</h3>

          <NumberField
            label="Người lớn"
            min={1}
            value={quantity.adults}
            onChange={(v) =>
              setQuantity({ ...quantity, adults: Number(v || 0) })
            }
          />
          <NumberField
            label="Trẻ em (70%)"
            min={0}
            value={quantity.children}
            onChange={(v) =>
              setQuantity({ ...quantity, children: Number(v || 0) })
            }
          />
          <NumberField
            label="Em bé (30%)"
            min={0}
            value={quantity.infants}
            onChange={(v) =>
              setQuantity({ ...quantity, infants: Number(v || 0) })
            }
          />

          <div className="border-t border-neutral-200 mt-4 pt-4 text-sm space-y-2">
            <p className="text-neutral-700">
              Tổng khách:{" "}
              <b className="text-neutral-900">
                {totalPeople} người
              </b>
            </p>
            <p className="text-neutral-700">
              Thành tiền:{" "}
              <span className="text-xl font-bold text-primary-600">
                {totalPrice.toLocaleString()} đ
              </span>
            </p>
          </div>

          {error && (
            <p className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg font-medium">
              {error}
            </p>
          )}

          <button
            onClick={handleCreateBooking}
            className="mt-4 w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-3 rounded-lg text-sm font-bold shadow-md transition"
          >
            ✅ TẠO BOOKING
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================
// SMALL UI HELPERS
// ========================
function Field({ label, value, onChange }) {
  return (
    <div className="mb-3">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <input
        className="border border-neutral-200 px-3 py-2 rounded-lg w-full text-sm mt-1.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function NumberField({ label, value, onChange, min = 0 }) {
  return (
    <div className="mb-3">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <input
        type="number"
        min={min}
        className="border border-neutral-200 px-3 py-2 rounded-lg w-full text-sm mt-1.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
