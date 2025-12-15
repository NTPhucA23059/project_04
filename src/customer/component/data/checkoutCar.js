export const CarBookings = [
  // CASE 1: ĐÃ THANH TOÁN, HỦY TRỄ → KHÔNG HOÀN
  {
    CarBookingID: 1,
    AccountID: 10,
    CarID: 1,

    // ==============================
    // THỜI GIAN NHẬN – TRẢ
    // ==============================
    PickupDate: "2025-01-28",
    PickupTime: "09:00",

    DropoffDate: "2025-01-30",
    DropoffTime: "20:00",

    // KH trả xe thực tế (ví dụ vẫn đi xong mới hủy trên hệ thống)
    ActualDropoffDate: "2025-01-30",
    ActualDropoffTime: "22:30",

    // ==============================
    // PHÍ PHỤ PHÍ
    // ==============================
    LateHours: 2.5,
    LateFee: 50.0,

    ExtraKM: 12,
    ExtraKMFee: 24.0,

    HasLateReturn: true,
    HasExtraKM: true,

    // ==============================
    // TIỀN THUÊ
    // ==============================
    BaseAmount: 150.0,
    FinalTotal: 224.0,

    // ==============================
    // TÙY CHỌN
    // ==============================
    NeedDriver: 1,
    NeedAirConditioner: 0,

    // ==============================
    // THANH TOÁN
    // ==============================
    PaymentMethod: "MOMO",     // đã thanh toán qua MOMO
    PaymentStatus: "Paid",     // ĐÃ THANH TOÁN
    RefundApplied: true,       // đã xử lý logic hoàn (kết quả 0%)

    // ==============================
    // TRẠNG THÁI BOOKING
    // ==============================
    BookingStatus: 3,
    // 1 = Active
    // 2 = Completed
    // 3 = Cancelled
    // 4 = Refunded

    BookingCode: "CAR-20250120-ABC123",

    // ==============================
    // THÔNG TIN KHÁCH HÀNG
    // ==============================
    CustomerName: "John Doe",
    CustomerPhone: "0912345678",
    CustomerEmail: "john@example.com",
    CustomerCitizenCard: "0123456789",
    Notes: "Pick up at airport",

    // ==============================
    // AUDIT
    // ==============================
    DateCreated: "2025-01-20 12:30:00",
    UpdatedAt: "2025-01-30 23:00:00",

    // ==============================
    // CANCEL DEADLINE
    // ==============================
    CancelDeadline: "2025-01-27 09:00:00" // hủy trước 24h mới được hoàn
  },

  // CASE 2: ĐÃ THANH TOÁN, HỦY SỚM → ĐƯỢC HOÀN 50%
  {
    CarBookingID: 2,
    AccountID: 11,
    CarID: 1,

    PickupDate: "2025-02-10",
    PickupTime: "08:00",

    DropoffDate: "2025-02-12",
    DropoffTime: "18:00",

    ActualDropoffDate: null,
    ActualDropoffTime: null,

    LateHours: 0,
    LateFee: 0,
    ExtraKM: 0,
    ExtraKMFee: 0,
    HasLateReturn: false,
    HasExtraKM: false,

    BaseAmount: 180.0,
    FinalTotal: 180.0,

    NeedDriver: 0,
    NeedAirConditioner: 1,

    PaymentMethod: "PAYPAL",
    PaymentStatus: "Paid",
    RefundApplied: true,   // đã gửi yêu cầu hoàn & xử lý

    BookingStatus: 1,      // Refunded

    BookingCode: "CAR-20250201-XYZ999",

    CustomerName: "Jane Smith",
    CustomerPhone: "0987654321",
    CustomerEmail: "jane@example.com",
    CustomerCitizenCard: "999888777",
    Notes: "Hotel pick-up",

    DateCreated: "2025-02-01 09:00:00",
    UpdatedAt: "2025-02-05 10:00:00",

    CancelDeadline: "2025-02-09 08:00:00" // hủy trước 1 ngày
  }, {
    CarBookingID: 99,
    AccountID: 10,
    CarID: 1,

    // ==============================
    // THỜI GIAN NHẬN – TRẢ (TRONG TƯƠNG LAI)
    // ==============================
    PickupDate: "2025-12-20",     // >> còn rất xa → luôn hiện nút hủy
    PickupTime: "09:00",

    DropoffDate: "2025-12-22",
    DropoffTime: "18:00",

    ActualDropoffDate: null,
    ActualDropoffTime: null,

    // ==============================
    // PHỤ PHÍ (chưa phát sinh)
    // ==============================
    LateHours: 0,
    LateFee: 0,
    ExtraKM: 0,
    ExtraKMFee: 0,
    HasLateReturn: false,
    HasExtraKM: false,

    // ==============================
    // TIỀN THUÊ
    // ==============================
    BaseAmount: 200.0,
    FinalTotal: 200.0,

    // ==============================
    // TÙY CHỌN
    // ==============================
    NeedDriver: 1,
    NeedAirConditioner: 1,

    // ==============================
    // THANH TOÁN (QUAN TRỌNG NHẤT)
    // ==============================
    PaymentMethod: "MOMO",
    PaymentStatus: "Paid",     // <<< ĐÃ THANH TOÁN → HỦY ĐƯỢC
    RefundApplied: false,      // <<< CHƯA HOÀN → CHO PHÉP HỦY

    // ==============================
    // TRẠNG THÁI BOOKING
    // ==============================
    BookingStatus: 1,         // 1 = Active → KH còn hiệu lực
    BookingCode: "CAR-TEST-999",

    // ==============================
    // THÔNG TIN KHÁCH HÀNG
    // ==============================
    CustomerName: "Test User",
    CustomerPhone: "0900000000",
    CustomerEmail: "test@example.com",
    CustomerCitizenCard: "123456789",
    Notes: "",

    // ==============================
    // AUDIT
    // ==============================
    DateCreated: "2025-12-01 10:00:00",
    UpdatedAt: null,

    // ==============================
    // CANCEL DEADLINE (cho phép hủy)
    // ==============================
    CancelDeadline: "2025-12-19 09:00:00"   // ngày 19 hủy vẫn được
  }
];




export const CarRefunds = [
  // CASE 2: BookingID 2 - HỦY SỚM → HOÀN 50%
  {
    CarRefundID: 1,
    CarBookingID: 2,                 // mapping đúng BookingID = 2
    RefundPercentage: 50,            // 50% (ví dụ trong policy)
    RefundAmount: 90.0,              // 50% của 180
    RefundReason: "Customer canceled 5 days before pickup",
    RefundStatus: 1,                 // 1 = processed
    CancelDate: "2025-02-05 09:00:00",
    ProcessedDate: "2025-02-05 14:30:00",
    StaffID: 3
  },

  // CASE 1: BookingID 1 - HỦY MUỘN → KHÔNG HOÀN
  {
    CarRefundID: 2,
    CarBookingID: 1,
    RefundPercentage: 0,
    RefundAmount: 0.0,
    RefundReason: "Cancellation window expired",
    RefundStatus: 2,                 // 2 = rejected / no-refund
    CancelDate: "2025-01-29 08:00:00", // sau CancelDeadline
    ProcessedDate: "2025-01-29 10:00:00",
    StaffID: 5
  }
];
