// =========================
//  HELPER: Convert VND → USD
// =========================
export const toUSD = (vnd) => Math.round(vnd / 24000);

// =========================
// IMPORT TOUR IMAGES
// =========================
import tour1 from "../../../assets/img/tour/Halong-Bay-Vietnam-08.jpg";
import tour2 from "../../../assets/img/tour/phuQuoc.jpg";
import tour3 from "../../../assets/img/tour/xethue.jpg";

// ======================================
//  UPDATED FAKE BOOKINGS (SNAPSHOT CORRECTED)
// ======================================
export const mockMyBookings = [

    // =============================
    // BOOKING 6 – Tour already started
    // =============================
    {
        BookingID: 506,
        OrderCode: "ORD202502000",
        AccountID: 1,

        CustomerName: "Late User",
        CustomerPhone: "0923334444",
        CustomerEmail: "late@example.com",
        CustomerCitizenCard: "888777666",

        CapacityAdult: 2,
        CapacityKid: 0,
        CapacityBaby: 0,

   
        TourDetailID: 103,
        TourName: "Hue – Da Nang 4D3N",
        TourImg: tour3,

        DepartureDate: "2025-03-01",
        ArrivalDate: "2025-03-04",

        AdultPrice: toUSD(3990000),
        ChildPrice: 0,
        InfantPrice: 0,

        UnitPrice: toUSD(3990000),
        OrderTotal: toUSD(3990000) * 2,

        PaymentMethod: "OFFICE",
        // OFFICE | MOMO | PAYPAL

        PaymentStatus: "Pending",
        // Pending | Paid | Failed | Cancelled
        PaidAt: "2025-02-20T10:00:00",

        OrderStatus: 2,
        // // IsRefundRequested: 0,
        // RefundStatus: 0,
        // RefundAmount: 0,
        
    },

    // =============================
    // BOOKING 7 – Test Cancel (2030)
    // =============================
    {
        BookingID: 999,
        OrderCode: "TESTCANCEL001",
        AccountID: 1,

        CustomerName: "Test Cancel",
        CustomerPhone: "0900000000",
        CustomerEmail: "test@cancel.com",
        CustomerCitizenCard: "000111222",

        CapacityAdult: 2,
        CapacityKid: 0,
        CapacityBaby: 0,

        TourID: 1,
        TourDetailID: 101,
        TourName: "Test Cancellation Tour",
        TourImg: tour1,

        DepartureDate: "2030-12-20",
        ArrivalDate: "2030-12-23",

        AdultPrice: 100,
        ChildPrice: 0,
        InfantPrice: 0,

        UnitPrice: 100,
        OrderTotal: 200,

        PaymentMethod: "OFFICE",
        // OFFICE | MOMO | PAYPAL

        PaymentStatus: "Pending",
        // Pending | Paid | Failed | Cancelled

        PaidAt: "2030-01-01T08:00:00",

        OrderStatus: 2,
        // 1 = Active
        // 2 = Completed
        // 3 = Cancelled
        // 4 = Refunded
        IsRefundRequested: 0,
        RefundStatus: 0,
        RefundAmount: 0,

        DateCreated: "2030-01-01",
        ExpireAt: Date.now() + 999999999,
    },
     {
        BookingID: 701,
        OrderCode: "TOUR2025PAID01",
        AccountID: 1,

        CustomerName: "Paid Future",
        CustomerPhone: "0911222333",
        CustomerEmail: "future@example.com",
        CustomerCitizenCard: "0123456789",

        CapacityAdult: 2,
        CapacityKid: 1,
        CapacityBaby: 0,

        TourID: 10,
        TourDetailID: 1001,
        TourName: "Singapore – Malaysia 5D4N",
        TourImg: "/assets/tour1.jpg",

        DepartureDate: "2030-05-20",
        ArrivalDate: "2030-05-25",

        UnitPrice: 150,
        OrderTotal: 150 * 3,

        PaymentMethod: "MOMO",
        PaymentStatus: "Paid",
        PaidAt: "2030-01-01T09:00:00",

        OrderStatus: 2, // đã thanh toán
        RefundStatus: 0, // chưa xin hoàn tiền
        RefundAmount: 0,

        DateCreated: "2030-01-01",
        ExpireAt: Date.now() + 999999999999, // không quan trọng vì đã thanh toán
    },
    {
        BookingID: 702,
        OrderCode: "TOUR2025PENDING01",
        AccountID: 1,

        CustomerName: "Pending User",
        CustomerPhone: "0999888777",
        CustomerEmail: "pending@example.com",
        CustomerCitizenCard: "223344556",

        CapacityAdult: 1,
        CapacityKid: 0,
        CapacityBaby: 0,

        TourID: 11,
        TourDetailID: 1002,
        TourName: "Thailand 4D3N",
        TourImg: "/assets/tour2.jpg",

        DepartureDate: "2026-02-10",
        ArrivalDate: "2026-02-14",

        UnitPrice: 100,
        OrderTotal: 100,

        PaymentMethod: "OFFICE",
        PaymentStatus: "Pending",

        OrderStatus: 1, // chưa thanh toán
        RefundStatus: 0,

        DateCreated: Date.now(),
        ExpireAt: Date.now() + 1000 * 60 * 60 * 23, // còn 23h nữa hết hạn
    },
    {
        BookingID: 703,
        OrderCode: "TOUR2025EXPIRED01",
        AccountID: 1,

        CustomerName: "Expired User",
        CustomerPhone: "0911002200",
        CustomerEmail: "expired@example.com",
        CustomerCitizenCard: "7788991122",

        CapacityAdult: 1,
        CapacityKid: 0,
        CapacityBaby: 0,

        TourID: 12,
        TourDetailID: 1003,
        TourName: "Da Lat 3D2N",
        TourImg: "/assets/tour3.jpg",

        DepartureDate: "2025-12-01",
        ArrivalDate: "2025-12-03",

        UnitPrice: 80,
        OrderTotal: 80,

        PaymentMethod: "OFFICE",
        PaymentStatus: "Pending",

        OrderStatus: 1, // pending
        RefundStatus: 0,

        DateCreated: "2025-10-01",
        ExpireAt: Date.now() - 1000 * 60 * 60 * 5, // hết hạn 5 tiếng
    },
    {
        BookingID: 704,
        OrderCode: "TOUR2025COMPLETED01",
        AccountID: 1,

        CustomerName: "Completed User",
        CustomerPhone: "0909090909",
        CustomerEmail: "done@example.com",
        CustomerCitizenCard: "5566778899",

        CapacityAdult: 3,
        CapacityKid: 0,
        CapacityBaby: 1,

        TourID: 13,
        TourDetailID: 1004,
        TourName: "Hue – Hoi An – Da Nang 5D4N",
        TourImg: "/assets/tour4.jpg",

        DepartureDate: "2024-01-05",
        ArrivalDate: "2024-01-10",

        UnitPrice: 120,
        OrderTotal: 120 * 4,

        PaymentMethod: "PAYPAL",
        PaymentStatus: "Paid",

        OrderStatus: 2, // paid
        RefundStatus: 0,
        RefundAmount: 0,

        DateCreated: "2023-12-01",
        ExpireAt: "2023-12-02T00:00:00",
    },
];
export const mockTourRefunds = [
    // =========================================================
    // Booking 503 – ĐÃ HỦY (Original cancelled booking)
    // Refund = 75%
    // =========================================================
    {
        RefundID: 1,
        BookingID: 503,
        RefundPercentage: 75,
        RefundAmount: Math.round((790000 / 24000) * 0.75),
        RefundReason: "Customer cancelled due to schedule change.",
        RefundStatus: 2, // 0 pending, 1 approved, 2 processed, 3 rejected
        CancelDate: "2025-03-10T09:00:00",
        ProcessedDate: "2025-03-11T10:00:00",
        StaffID: 2,

        // Bank Info Snapshot
        BankName: "Vietcombank",
        BankAccount: "0123456789",
        AccountHolder: "Nguyen Van B"
    },

    // =========================================================
    // Booking 504 – Pending, 3 days before → Refund 85%
    // =========================================================
    {
        RefundID: 2,
        BookingID: 504,
        RefundPercentage: 85,
        RefundAmount: Math.round((3490000 * 2) / 24000 * 0.85),
        RefundReason: "Customer requested cancellation.",
        RefundStatus: 1, // approved
        CancelDate: "2025-04-06T10:20:00",
        ProcessedDate: null,
        StaffID: null,

        BankName: "Techcombank",
        BankAccount: "199988887777",
        AccountHolder: "Test User"
    },

    // =========================================================
    // Booking 505 – Paid, 5 days before → Refund 95%
    // =========================================================
    {
        RefundID: 3,
        BookingID: 505,
        RefundPercentage: 95,
        RefundAmount: Math.round((3290000 + 3290000 * 0.7) / 24000 * 0.95),
        RefundReason: "Customer wants to cancel early.",
        RefundStatus: 1, // approved
        CancelDate: "2025-04-07T09:00:00",
        ProcessedDate: null,
        StaffID: null,

        BankName: "MB Bank",
        BankAccount: "00011223344",
        AccountHolder: "Paid User"
    },

    // =========================================================
    // Booking 999 – Test Cancel (Future, always allowed)
    // Refund = 95% (default for >5 days)
    // =========================================================
    {
        RefundID: 4,
        BookingID: 999,
        RefundPercentage: 95,
        RefundAmount: Math.round(200 * 0.95),
        RefundReason: "Testing refund feature.",
        RefundStatus: 0, // pending
        CancelDate: "2030-01-05T15:00:00",
        ProcessedDate: null,
        StaffID: null,

        BankName: "ACB",
        BankAccount: "555666777888",
        AccountHolder: "Test Cancel"
    }
   
];


