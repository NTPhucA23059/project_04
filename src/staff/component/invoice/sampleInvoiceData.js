// Sample data linking bookings, invoices, refunds and bank info
export const sampleBookings = [
  {
    bookingId: 201,
    tourCode: "DN-3N2D",
    tourName: "Da Nang - Hoi An 3D2N",
    customer: { name: "Nguyen Van A", phone: "0901234567", email: "a@example.com" },
    paidAmount: 9000000,
  },
  {
    bookingId: 202,
    tourCode: "PQ-4N3D",
    tourName: "Phu Quoc Resort 4D3N",
    customer: { name: "Tran Thi B", phone: "0988123456", email: "b@example.com" },
    paidAmount: 12000000,
  },
  {
    bookingId: 203,
    tourCode: "DL-2N1D",
    tourName: "Da Lat Chill 2D1N",
    customer: { name: "Le Minh C", phone: "0912345678", email: "c@example.com" },
    paidAmount: 5000000,
  },
];

export const sampleInvoices = [
  {
    invoiceId: "INV-202512-001",
    bookingId: 201,
    issueDate: "2025-12-05T09:30:00",
    paymentMethod: "BANK_TRANSFER",
  },
  {
    invoiceId: "INV-202512-002",
    bookingId: 202,
    issueDate: "2025-12-06T14:10:00",
    paymentMethod: "CASH",
  },
  {
    invoiceId: "INV-202512-003",
    bookingId: 203,
    issueDate: "2025-12-07T08:50:00",
    paymentMethod: "BANK_TRANSFER",
  },
];

export const sampleRefunds = [
  {
    refundId: 3001,
    bookingId: 201,
    refundPercentage: 20,
    refundAmount: 1800000,
    reason: "Customer canceled 3 days before departure",
    status: 0, // 0=pending,1=done,2=rejected
    cancelDate: "2025-12-12T09:30:00",
    processedDate: null,
    bankInfo: {
      bankName: "Vietcombank",
      bankAccount: "0123456789",
      accountHolder: "Nguyen Van A",
      note: "",
    },
  },
  {
    refundId: 3002,
    bookingId: 203,
    refundPercentage: 100,
    refundAmount: 5000000,
    reason: "Trip cancelled by operator",
    status: 1,
    cancelDate: "2025-12-05T11:00:00",
    processedDate: "2025-12-05T16:00:00",
    bankInfo: {
      bankName: "MB Bank",
      bankAccount: "123123123",
      accountHolder: "Le Minh C",
      note: "Full refund processed",
    },
  },
];

