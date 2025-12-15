
export const toUSD = (vnd) => Math.round(vnd / 24000);
import tour1 from "../../../assets/img/tour/Halong-Bay-Vietnam-08.jpg";
import tour2 from "../../../assets/img/tour/phuQuoc.jpg";
import car1 from "../../../assets/img/tour/xethue.jpg";


// =========================
//  TOUR CATEGORIES
// =========================
export const mockCategories = [
    {
        CategoryID: 1,
        CategoryCode: "VN_TOUR",
        CategoryName: "Vietnam Tours",
        Description: "Top attractions and destinations in Vietnam",
        Status: "Active",
    },
    {
        CategoryID: 2,
        CategoryCode: "ASIA_TOUR",
        CategoryName: "Asia Tours",
        Description: "Unique cultures and exciting experiences across Asia",
        Status: "Active",
    },
    {
        CategoryID: 3,
        CategoryCode: "EURO_TOUR",
        CategoryName: "Europe Tours",
        Description: "Explore beautiful European countries",
        Status: "Active",
    },
    {
        CategoryID: 4,
        CategoryCode: "RELAX_TOUR",
        CategoryName: "Leisure & Resort Tours",
        Description: "Premium resort, spa, and leisure travel",
        Status: "Active",
    },
];


// =========================
//  SEASONS
// =========================
export const mockSeasons = [
    {
        SeasonID: 1,
        SeasonCode: "SUMMER",
        SeasonName: "Summer",
        StartMonth: 5,
        EndMonth: 8,
        Description: "Peak travel season with great weather",
        Status: 1,
    },
    {
        SeasonID: 2,
        SeasonCode: "WINTER",
        SeasonName: "Winter",
        StartMonth: 11,
        EndMonth: 2,
        Description: "Cold weather – ideal for European tours",
        Status: 1,
    },
];


// =========================
//  MAIN TOUR LIST
// =========================
export const tours = [
    {
        TourID: 1,
        TourCode: "VNPQ3N2D",
        TourName: "Phu Quoc 3D2N – Island Paradise",
        TourImg: tour1,
        TourDescription: "Discover Phu Quoc Island with blue sea, white sand, and golden sunlight.",
        Nation: "Vietnam",
        StartingLocation: "Ho Chi Minh City",
        Duration: "3D2N",
        Price: toUSD(3290000),
        CategoryID: 1,
    },
    {
        TourID: 2,
        TourCode: "DN3N2D",
        TourName: "Da Nang – Cham Island – Hoi An – Ba Na Hills",
        TourImg: tour1,
        TourDescription: "Explore the beauty of Central Vietnam with famous attractions.",
        Nation: "Vietnam",
        StartingLocation: "Ho Chi Minh City",
        Duration: "3D2N",
        Price: toUSD(3490000),
        CategoryID: 1,
    },
    {
        TourID: 3,
        TourCode: "MT4N3D",
        TourName: "Central Vietnam 4D3N – Da Nang – Hue – Hoi An",
        TourImg: tour1,
        TourDescription: "A cultural and coastal journey through Central Vietnam.",
        Nation: "Vietnam",
        StartingLocation: "Ho Chi Minh City",
        Duration: "4D3N",
        Price: toUSD(3990000),
        CategoryID: 1,
    },
    {
        TourID: 4,
        TourCode: "HL3N2D",
        TourName: "Ha Long Bay 3D2N – Natural Wonder",
        TourImg: tour1,
        TourDescription: "Admire Ha Long Bay – a world natural wonder.",
        Nation: "Vietnam",
        StartingLocation: "Hanoi",
        Duration: "3D2N",
        Price: toUSD(4500000),
        CategoryID: 4,
    },
    {
        TourID: 5,
        TourCode: "SG-MK1N",
        TourName: "Mekong Delta 1 Day – My Tho – Ben Tre",
        TourImg: tour1,
        TourDescription: "Discover the Mekong Delta with rivers and floating markets.",
        Nation: "Vietnam",
        StartingLocation: "Ho Chi Minh City",
        Duration: "1D",
        Price: toUSD(790000),
        CategoryID: 1,
    },
    {
        TourID: 6,
        TourCode: "KR5N4D",
        TourName: "Korea – Seoul – Nami – Everland",
        TourImg: tour1,
        TourDescription: "Explore South Korea in spring or autumn foliage.",
        Nation: "South Korea",
        StartingLocation: "Ho Chi Minh City",
        Duration: "5D4N",
        Price: toUSD(13900000),
        CategoryID: 2,
    },
    {
        TourID: 7,
        TourCode: "JP6N5D",
        TourName: "Japan – Tokyo – Fuji – Osaka",
        TourImg: tour1,
        TourDescription: "Experience Japan with its unique culture and cherry blossoms.",
        Nation: "Japan",
        StartingLocation: "Ho Chi Minh City",
        Duration: "6D5N",
        Price: toUSD(25900000),
        CategoryID: 2,
    },
    {
        TourID: 8,
        TourCode: "EU9N8D",
        TourName: "Europe 9D8N – France – Italy – Switzerland",
        TourImg: tour1,
        TourDescription: "A dream journey through the heart of Europe.",
        Nation: "Europe",
        StartingLocation: "Ho Chi Minh City",
        Duration: "9D8N",
        Price: toUSD(69900000),
        CategoryID: 3,
    },
    {
        TourID: 9,
        TourCode: "US10N9D",
        TourName: "USA 10D9N – New York – Washington – Las Vegas",
        TourImg: tour1,
        TourDescription: "Experience the dynamic and modern United States.",
        Nation: "USA",
        StartingLocation: "Ho Chi Minh City",
        Duration: "10D9N",
        Price: toUSD(73900000),
        CategoryID: 3,
    },
    {
        TourID: 10,
        TourCode: "AE5N4D",
        TourName: "Dubai 5D4N – Desert Safari – Burj Khalifa",
        TourImg: tour1,
        TourDescription: "Discover the luxurious and modern city of Dubai.",
        Nation: "UAE",
        StartingLocation: "Ho Chi Minh City",
        Duration: "5D4N",
        Price: toUSD(25900000),
        CategoryID: 2,
    },
];


// =========================
//  TOUR DETAILS
// =========================
export const mockTourDetails = [
    {
        TourDetailID: 101,
        TourID: 1,
        DepartureDate: "2025-06-10",
        ArrivalDate: "2025-06-13",
        NumberOfGuests: 30,
        MinimumNumberOfGuests: 10,
        BookedSeat: 12,
        UnitPrice: toUSD(3290000),
        Status: "Open",
        FromLocation: "Ho Chi Minh City",
        ToLocation: "Phu Quoc",
        TourDetailDescription: "Discover Phu Quoc with beautiful beaches.",
        SeasonID: 1,
    },
    {
        TourDetailID: 102,
        TourID: 2,
        DepartureDate: "2025-07-08",
        ArrivalDate: "2025-07-11",
        NumberOfGuests: 25,
        MinimumNumberOfGuests: 8,
        BookedSeat: 20,
        UnitPrice: toUSD(3490000),
        Status: "Open",
        FromLocation: "Ho Chi Minh City",
        ToLocation: "Da Nang – Hoi An – Ba Na Hills",
        TourDetailDescription: "The most attractive Central Vietnam tour in 2025.",
        SeasonID: 1,
    },
    {
        TourDetailID: 103,
        TourID: 3,
        DepartureDate: "2025-08-04",
        ArrivalDate: "2025-08-07",
        NumberOfGuests: 35,
        MinimumNumberOfGuests: 12,
        BookedSeat: 15,
        UnitPrice: toUSD(3990000),
        Status: "Open",
        FromLocation: "Ho Chi Minh City",
        ToLocation: "Da Nang – Hue – Hoi An",
        TourDetailDescription: "A complete 4D3N Central Vietnam journey.",
        SeasonID: 1,
    },
    {
        TourDetailID: 104,
        TourID: 4,
        DepartureDate: "2025-09-12",
        ArrivalDate: "2025-09-15",
        NumberOfGuests: 28,
        MinimumNumberOfGuests: 10,
        BookedSeat: 18,
        UnitPrice: toUSD(4500000),
        Status: "Open",
        FromLocation: "Hanoi",
        ToLocation: "Ha Long Bay",
        TourDetailDescription: "Visit the world-famous natural wonder.",
        SeasonID: 1,
    },
    {
        TourDetailID: 105,
        TourID: 5,
        DepartureDate: "2025-05-03",
        ArrivalDate: "2025-05-04",
        NumberOfGuests: 40,
        MinimumNumberOfGuests: 10,
        BookedSeat: 33,
        UnitPrice: toUSD(790000),
        Status: "Open",
        FromLocation: "Ho Chi Minh City",
        ToLocation: "My Tho – Ben Tre",
        TourDetailDescription: "The hottest Mekong Delta tour of the year.",
        SeasonID: 1,
    },
    {
        TourDetailID: 106,
        TourID: 6,
        DepartureDate: "2025-10-01",
        ArrivalDate: "2025-10-05",
        NumberOfGuests: 22,
        MinimumNumberOfGuests: 10,
        BookedSeat: 10,
        UnitPrice: toUSD(13900000),
        Status: "Open",
        FromLocation: "Ho Chi Minh City",
        ToLocation: "Seoul – Nami – Everland",
        TourDetailDescription: "Travel to Korea during the fall foliage.",
        SeasonID: 2,
    },
    {
        TourDetailID: 107,
        TourID: 7,
        DepartureDate: "2025-11-10",
        ArrivalDate: "2025-11-15",
        NumberOfGuests: 26,
        MinimumNumberOfGuests: 12,
        BookedSeat: 20,
        UnitPrice: toUSD(25900000),
        Status: "Open",
        FromLocation: "Ho Chi Minh City",
        ToLocation: "Tokyo – Mount Fuji – Osaka",
        TourDetailDescription: "A winter journey through Japan.",
        SeasonID: 2,
    },
    {
        TourDetailID: 108,
        TourID: 8,
        DepartureDate: "2025-12-01",
        ArrivalDate: "2025-12-09",
        NumberOfGuests: 20,
        MinimumNumberOfGuests: 10,
        BookedSeat: 10,
        UnitPrice: toUSD(69900000),
        Status: "Open",
        FromLocation: "Ho Chi Minh City",
        ToLocation: "Paris – Rome – Zurich",
        TourDetailDescription: "A magical European winter experience.",
        SeasonID: 2,
    },
    {
        TourDetailID: 109,
        TourID: 9,
        DepartureDate: "2025-12-10",
        ArrivalDate: "2025-12-19",
        NumberOfGuests: 24,
        MinimumNumberOfGuests: 10,
        BookedSeat: 16,
        UnitPrice: toUSD(73900000),
        Status: "Open",
        FromLocation: "Ho Chi Minh City",
        ToLocation: "New York – Washington – Las Vegas",
        TourDetailDescription: "An unforgettable journey through the USA.",
        SeasonID: 2,
    },
    {
        TourDetailID: 110,
        TourID: 10,
        DepartureDate: "2025-09-10",
        ArrivalDate: "2025-09-14",
        NumberOfGuests: 18,
        MinimumNumberOfGuests: 8,
        BookedSeat: 10,
        UnitPrice: toUSD(25900000),
        Status: "Open",
        FromLocation: "Ho Chi Minh City",
        ToLocation: "Dubai – Desert Safari",
        TourDetailDescription: "A luxurious and exciting Dubai adventure.",
        SeasonID: 1,
    },
];


// =========================
//  TOUR IMAGES
// =========================
export const mockTourDetailImages = [
    {
        ImageID: 1,
        TourDetailID: 101,

        ImageUrl: tour2,
        Caption: "Phu Quoc"
    },
    {
        ImageID: 2,
        TourDetailID: 101,
        ImageUrl: tour2,
        Caption: "Phu Quoc"
    },
    { ImageID: 3, TourDetailID: 101, ImageUrl: tour2, Caption: "Phu Quoc" },
    { ImageID: 4, TourDetailID: 101, ImageUrl: tour2, Caption: "Phu Quoc" },

    {
        ImageID: 5,
        TourDetailID: 102,
        ImageUrl: tour2,
        Caption: "Da Nang"
    },
    {
        ImageID: 6,

        TourDetailID: 103,
        ImageUrl: tour2,
        Caption: "Ba Na Hills"
    },
    {
        ImageID: 7,
        TourDetailID: 104,
        ImageUrl: tour2,

        Caption: "Ha Long Bay"
    },
    {
        ImageID: 8,
        TourDetailID: 105,
        ImageUrl: tour1,
        Caption: "Mekong Delta"
    },
    { ImageID: 9, TourDetailID: 106, ImageUrl: tour1, Caption: "Everland" },
    { ImageID: 10, TourDetailID: 107, ImageUrl: tour1, Caption: "Mount Fuji" },
    { ImageID: 11, TourDetailID: 108, ImageUrl: tour1, Caption: "Europe Tour" },
    { ImageID: 12, TourDetailID: 109, ImageUrl: tour1, Caption: "New York" },
    { ImageID: 13, TourDetailID: 110, ImageUrl: tour1, Caption: "Dubai" },
];
export const mockTourReviews = [
    // ===== Tour 101 – Phu Quoc =====
    {
        ReviewID: 1,
        AccountID: 1,
        TourDetailID: 101,
        Rating: 5,
        Comment: "Amazing trip! The beach was beautiful and the tour guide was very friendly.",
        CreatedAt: "2025-01-12T10:30:00"
    },
    {
        ReviewID: 2,
        AccountID: 2,
        TourDetailID: 101,
        Rating: 4,
        Comment: "Great experience overall. The hotel was clean and the food was delicious.",
        CreatedAt: "2025-01-13T09:10:00"
    },
    {
        ReviewID: 3,
        AccountID: 3,
        TourDetailID: 101,
        Rating: 5,
        Comment: "Loved Phu Quoc! Highly recommend this tour for families.",
        CreatedAt: "2025-01-14T14:45:00"
    },
    {
        ReviewID: 4,
        AccountID: 1,
        TourDetailID: 101,
        Rating: 5,
        Comment: "Amazing trip! The beach was beautiful and the tour guide was very friendly.",
        CreatedAt: "2025-01-12T10:30:00"
    },
    {
        ReviewID: 5,
        AccountID: 2,
        TourDetailID: 101,
        Rating: 4,
        Comment: "Great experience overall. The hotel was clean and the food was delicious.",
        CreatedAt: "2025-01-13T09:10:00"
    },
    {
        ReviewID: 6,
        AccountID: 3,
        TourDetailID: 101,
        Rating: 5,
        Comment: "Loved Phu Quoc! Highly recommend this tour for families.",
        CreatedAt: "2025-01-14T14:45:00"
    },
    // ===== Tour 102 – Da Nang – Hoi An =====
    {
        ReviewID: 4,
        AccountID: 1,
        TourDetailID: 102,
        Rating: 5,
        Comment: "Ba Na Hills is absolutely stunning. The Golden Bridge was unforgettable!",
        CreatedAt: "2025-02-01T11:20:00"
    },
    {
        ReviewID: 5,
        AccountID: 4,
        TourDetailID: 102,
        Rating: 4,
        Comment: "Everything was smooth and well-organized. A bit crowded but worth it.",
        CreatedAt: "2025-02-03T15:30:00"
    },
    {
        ReviewID: 6,
        AccountID: 5,
        TourDetailID: 102,
        Rating: 5,
        Comment: "The tour guide was excellent and very knowledgeable.",
        CreatedAt: "2025-02-04T08:55:00"
    },

    // ===== Tour 103 – Central Vietnam =====
    {
        ReviewID: 7,
        AccountID: 2,
        TourDetailID: 103,
        Rating: 5,
        Comment: "Beautiful scenery and great itinerary. I loved every moment of the trip.",
        CreatedAt: "2025-03-02T13:15:00"
    },
    {
        ReviewID: 8,
        AccountID: 3,
        TourDetailID: 103,
        Rating: 4,
        Comment: "Great value for money. The temples and beaches were amazing.",
        CreatedAt: "2025-03-05T09:40:00"
    },

    // ===== Tour 106 – Korea =====
    {
        ReviewID: 9,
        AccountID: 1,
        TourDetailID: 106,
        Rating: 5,
        Comment: "Nami Island in autumn is breathtaking. Highly recommended!",
        CreatedAt: "2025-04-10T16:00:00"
    },
    {
        ReviewID: 10,
        AccountID: 4,
        TourDetailID: 106,
        Rating: 5,
        Comment: "Korea was amazing. The guide spoke perfect English and was very helpful.",
        CreatedAt: "2025-04-12T17:25:00"
    },

    // ===== Tour 107 – Japan =====
    {
        ReviewID: 11,
        AccountID: 2,
        TourDetailID: 107,
        Rating: 5,
        Comment: "Tokyo and Osaka were incredible. The Mount Fuji tour was the highlight!",
        CreatedAt: "2025-05-01T12:10:00"
    },
    {
        ReviewID: 12,
        AccountID: 3,
        TourDetailID: 107,
        Rating: 4,
        Comment: "Great food and beautiful places, but the weather was extremely cold.",
        CreatedAt: "2025-05-02T09:55:00"
    }
];
// ===========================
// TRANSPORTATION TYPES
// ===========================
export const mockTransportationTypes = [
    {
        TransportationID: 1,
        TypeName: "Xe du lịch",
        Description: "Xe 16–45 chỗ",
    },
    {
        TransportationID: 2,
        TypeName: "Tàu / thuyền",
        Description: "Di chuyển đường thủy",
    },
    {
        TransportationID: 3,
        TypeName: "Máy bay",
        Description: "Vé bay theo hành trình",
    },
];


// ===========================
// TOUR SCHEDULES (Days)
// ===========================
export const mockTourSchedules = [
    {
        ScheduleID: 1,
        DayNumber: 1,
        Title: "TP. Hồ Chí Minh – Đà Nẵng – Sơn Trà – Phố Cổ Hội An",
        MealInfo: "02 bữa ăn (trưa, chiều)",
        Summarys: "Tham quan Sơn Trà và Hội An",
        TourDetailID: 101,
    },
    {
        ScheduleID: 2,
        DayNumber: 2,
        Title: "Đà Nẵng – KDL Bà Nà – Cầu Vàng",
        MealInfo: "02 bữa ăn (sáng, chiều)",
        Summarys: "Check-in Cầu Vàng – Bà Nà Hills",
        TourDetailID: 101,
    },
    {
        ScheduleID: 3,
        DayNumber: 3,
        Title: "Đà Nẵng – Đầm Lập An – Huế – Đại Nội – Điện Kiến Trung",
        MealInfo: "03 bữa ăn (sáng, trưa, chiều)",
        Summarys: "Khám phá cầu Lập An – Đại Nội",
        TourDetailID: 101,
    },
    {
        ScheduleID: 4,
        DayNumber: 4,
        Title: "Huế – VQG Phong Nha – Kẻ Bàng – Động Thiên Đường",
        MealInfo: "03 bữa ăn (sáng, trưa, chiều)",
        Summarys: "Tham quan thiên nhiên hùng vĩ",
        TourDetailID: 101,
    },
    {
        ScheduleID: 5,
        DayNumber: 5,
        Title: "Đồng Hới – Thánh Địa La Vang – Huế – TP.HCM",
        MealInfo: "02 bữa ăn (sáng, trưa)",
        Summarys: "Kết thúc chương trình",
        TourDetailID: 101,
    },
];


// ===========================
// TOUR SCHEDULE ITEMS (Activities)
// ===========================
export const mockTourScheduleItems = [
    // =======================
    // NGÀY 1
    // =======================
    {
        ItemID: 1,
        ScheduleID: 1,
        SortOrder: 1,
        TimeInfo: "07:00",
        Activity: "Tập trung tại sân bay Tân Sơn Nhất, làm thủ tục chuyến bay đi Đà Nẵng.",
        PlaceName: "Sân bay Tân Sơn Nhất",
        PlaceAddress: "Trường Sơn, P.2, Q.Tân Bình, TP.HCM",
        TransportationID: 3,
        ImageUrl: tour2,
        Cost: 0,
    },
    {
        ItemID: 2,
        ScheduleID: 1,
        SortOrder: 2,
        TimeInfo: "10:30",
        Activity: "Đến Đà Nẵng – Xe đón đoàn tham quan Bán đảo Sơn Trà.",
        PlaceName: "Sơn Trà",
        PlaceAddress: "P.Thọ Quang, Q.Sơn Trà, Đà Nẵng",
        TransportationID: 1,
        ImageUrl: tour2,
        Cost: 0,
    },
    {
        ItemID: 3,
        ScheduleID: 1,
        SortOrder: 3,
        TimeInfo: "16:00",
        Activity: "Tham quan phố cổ Hội An – check-in Chùa Cầu, Phố Đèn Lồng.",
        PlaceName: "Phố Cổ Hội An",
        PlaceAddress: "Minh An, Hội An, Quảng Nam",
        TransportationID: 1,
        ImageUrl: tour2,
        Cost: 120000,
    },

    // =======================
    // NGÀY 2
    // =======================
    {
        ItemID: 4,
        ScheduleID: 2,
        SortOrder: 1,
        TimeInfo: "08:00",
        Activity: "Khởi hành đi Bà Nà Hills – tham quan Cầu Vàng.",
        PlaceName: "Bà Nà Hills",
        PlaceAddress: "Thôn An Sơn, Hòa Ninh, Hòa Vang, Đà Nẵng",
        TransportationID: 1,
        ImageUrl: tour2,
        Cost: 900000,
    },
    {
        ItemID: 5,
        ScheduleID: 2,
        SortOrder: 2,
        TimeInfo: "14:00",
        Activity: "Tự do vui chơi Fantasy Park, tàu hỏa leo núi.",
        PlaceName: "Fantasy Park",
        PlaceAddress: "Bà Nà Hills, Đà Nẵng",
        TransportationID: 1,
        ImageUrl: tour2,
        Cost: 0,
    },

    // =======================
    // NGÀY 3
    // =======================
    {
        ItemID: 6,
        ScheduleID: 3,
        SortOrder: 1,
        TimeInfo: "08:00",
        Activity: "Check-in Đầm Lập An – ngắm cảnh núi và biển tuyệt đẹp.",
        PlaceName: "Đầm Lập An",
        PlaceAddress: "Phú Lộc, Thừa Thiên Huế",
        TransportationID: 1,
        ImageUrl: tour2,
        Cost: 0,
    },
    {
        ItemID: 7,
        ScheduleID: 3,
        SortOrder: 2,
        TimeInfo: "14:00",
        Activity: "Tham quan Đại Nội Huế – Điện Kiến Trung.",
        PlaceName: "Đại Nội Huế",
        PlaceAddress: "Thuận Thành, TP.Huế",
        TransportationID: 1,
        ImageUrl: tour2,
        Cost: 150000,
    },

    // =======================
    // NGÀY 4
    // =======================
    {
        ItemID: 8,
        ScheduleID: 4,
        SortOrder: 1,
        TimeInfo: "09:00",
        Activity: "Khám phá Vườn Quốc Gia Phong Nha – Kẻ Bàng, đi thuyền vào động.",
        PlaceName: "Phong Nha – Kẻ Bàng",
        PlaceAddress: "Sơn Trạch, Bố Trạch, Quảng Bình",
        TransportationID: 2,
        ImageUrl: tour2,
        Cost: 550000,
    },

    // =======================
    // NGÀY 5
    // =======================
    {
        ItemID: 9,
        ScheduleID: 5,
        SortOrder: 1,
        TimeInfo: "08:00",
        Activity: "Viếng Thánh Địa La Vang.",
        PlaceName: "La Vang",
        PlaceAddress: "Hải Lăng, Quảng Trị",
        TransportationID: 1,
        ImageUrl: tour2,
        Cost: 0,
    },
    {
        ItemID: 10,
        ScheduleID: 5,
        SortOrder: 2,
        TimeInfo: "12:00",
        Activity: "Xe đưa đoàn ra sân bay Đồng Hới – bay về TP.HCM.",
        PlaceName: "Sân bay Đồng Hới",
        PlaceAddress: "Lý Thường Kiệt, Đồng Hới, Quảng Bình",
        TransportationID: 3,
        ImageUrl: tour2,
        Cost: 0,
    },
];

// =============================
// CAR TYPES
// =============================
export const mockCarTypes = [
    {
        CarTypeID: 1,
        TypeCode: "SUV_7",
        TypeName: "SUV 7-Seater",
        Description: "Premium 7-seat SUV for family and business trips",
        Status: 1,
    },
    {
        CarTypeID: 2,
        TypeCode: "MPV_7",
        TypeName: "MPV 7-Seater",
        Description: "Spacious and comfortable MPV category",
        Status: 1,
    },
    {
        CarTypeID: 3,
        TypeCode: "SEDAN",
        TypeName: "Sedan",
        Description: "4-seat sedan for personal or business needs",
        Status: 1,
    }
];
// =============================
// CARS
// =============================
export const cars = [
    {
        CarID: 1,                 // ID xe - khóa chính, dùng để join với Booking, Refund

        ImageUrl: car1,           // Ảnh đại diện hiển thị trong danh sách xe


        CarCode: "KIA_CARNIVAL_2025",
        // Mã xe duy nhất (dùng nội bộ hoặc in hợp đồng)
        ModelName: "KIA Carnival 2025",
        // Tên dòng xe
        Brand: "KIA",             // Hãng xe (Toyota, Vinfast, KIA…)

        SeatingCapacity: 7,       // Số chỗ ngồi
        Luggage: 4,               // Số vali hành lý chứa được
        FuelType: "Gasoline",     // Loại nhiên liệu
        Transmission: "Automatic",
        // Hộp số (số tự động / số sàn)
        ModelYear: 2025,          // Năm sản xuất

        HasAirConditioner: 1,     // Xe có điều hòa (1 = có, 0 = không)
        HasDriverOption: 1,       // Có hỗ trợ thuê tài xế (1 = có)
        SelfDriveAllowed: 0,      // Có cho khách tự lái không (0 = không, 1 = có)

        // =============================
        // GIÁ TIỀN THEO NGÀY, GIỜ, LỄ
        // =============================
        DailyRate: 18,            // Giá thuê theo ngày (USD)
        HourlyRate: 5,            // Giá thuê theo giờ (nếu áp dụng)
        WeekendRate: 22,          // Giá thuê cuối tuần (Fri–Sun)
        HolidayRate: 25,          // Giá thuê ngày lễ / Tết

        // =============================
        // GIỚI HẠN KM & PHỤ PHÍ
        // =============================
        KmLimitPerDay: 150,       // Giới hạn số km mỗi ngày
        ExtraKmRate: 2,           // Giá phụ phí/km khi vượt
        ExtraHourRate: 20,        // Giá phụ phí/giờ khi trả xe trễ

        PlateNumber: "51H-889.22",
        // Biển số xe – dùng để đối chiếu khi nhận/trả xe

        Status: "Available",
        // Trạng thái:
        // "Available" – sẵn sàng cho thuê
        // "Rented" – đang có khách thuê
        // "InMaintenance" – đang bảo dưỡng
        // "Inactive" – ngưng hoạt động

        // =============================
        // THEO DÕI BẢO DƯỠNG
        // =============================
        CurrentKM: 123000,        // Km hiện tại của xe (tính vượt km)
        MaintenanceDueKM: 125000, // Km cần bảo dưỡng tiếp theo
        MaintenanceStatus: "Pending",
        // "Pending" – sắp bảo dưỡng
        // "Done" – đã bảo dưỡng
        // "Overdue" – quá hạn bảo dưỡng

        Note: "Luxury 7-seat MPV for VIP service",
        // Ghi chú thêm dùng cho admin hoặc hiển thị cho khách
        CarTypeID: 2,             // Join với bảng loại xe (SUV, MPV, Sedan…)

        AllowedProvinces: ["HCM", "Long An", "Binh Duong"],
        // Phạm vi được phép di chuyển (áp dụng tính phí ngoài vùng)

        Rules: [
            "No smoking",                     // Cấm hút thuốc
            "No overloaded passenger capacity",
            // Cấm chở quá số người quy định
            "Driver included — customer cannot self-drive",
            // Xe này bắt buộc có tài xế
            "Travel only within allowed provinces"
            // Chỉ được đi trong tỉnh cho phép
        ]
    }


];
// =============================
// REFUND RULES (APPLY FOR TOURS / CARS)
// =============================

// Cách dùng (pseudo):
// const daysBefore = differenceInDays(DepartureDate, CancelDate);
// const rule = refundRules.find(r => daysBefore >= r.MinDaysBefore && daysBefore <= r.MaxDaysBefore);
// refundPercent = rule ? rule.RefundPercentage : 0;

export const refundRules = [
  {
    MinDaysBefore: 5,        // Hủy trước >= 5 ngày
    MaxDaysBefore: 999,      // Không giới hạn trên (5 ngày trở lên)
    RefundPercentage: 95,    // Hoàn 95%
    Label: "Hủy trước ≥ 5 ngày: hoàn 95%",
  },
  {
    MinDaysBefore: 4,        // Hủy trước 4 ngày
    MaxDaysBefore: 4,
    RefundPercentage: 90,
    Label: "Hủy trước 4 ngày: hoàn 90%",
  },
  {
    MinDaysBefore: 3,        // Hủy trước 3 ngày
    MaxDaysBefore: 3,
    RefundPercentage: 85,
    Label: "Hủy trước 3 ngày: hoàn 85%",
  },
  {
    MinDaysBefore: 2,        // Hủy trước 2 ngày
    MaxDaysBefore: 2,
    RefundPercentage: 80,
    Label: "Hủy trước 2 ngày: hoàn 80%",
  },
  {
    MinDaysBefore: 1,        // Hủy trước 1 ngày
    MaxDaysBefore: 1,
    RefundPercentage: 75,
    Label: "Hủy trước 1 ngày: hoàn 75%",
  },
  {
    MinDaysBefore: 0,        // Hủy đúng ngày khởi hành
    MaxDaysBefore: 0,
    RefundPercentage: 0,     // Không hoàn
    Label: "Hủy trong ngày khởi hành: không hoàn tiền",
  },
];

// =============================
// CAR IMAGES
// =============================
export const mockCarImages = [
    // ------- KIA Carnival 2025 -------
    {
        ImageID: 1,
        CarID: 1,
        ImageUrl: car1,
        Caption: "Exterior Front",
        SortOrder: 1,
    },
    {
        ImageID: 2,
        CarID: 1,
        ImageUrl: car1,
        Caption: "Luxury Interior",
        SortOrder: 2,
    },
    {
        ImageID: 3,
        CarID: 1,
        ImageUrl: car1,
        Caption: "Rear Seats",
        SortOrder: 3,
    },
    {
        ImageID: 4,
        CarID: 1,
        ImageUrl: car1,
        Caption: "Side View",
        SortOrder: 4,
    },

    // ------- Toyota Fortuner -------
    {
        ImageID: 5,
        CarID: 2,
        ImageUrl: car1,
        Caption: "Front View",
    },
    {
        ImageID: 6,
        CarID: 2,
        ImageUrl: car1,
        Caption: "Back Seat",
    },

    // ------- VinFast Lux A2 -------
    {
        ImageID: 7,
        CarID: 3,
        ImageUrl: car1,
        Caption: "Exterior",
    },
    {
        ImageID: 8,
        CarID: 3,
        ImageUrl: car1,
        Caption: "Interior",
    }
];
// =============================
// CAR REVIEWS
// =============================
export const mockCarReviews = [
    // ---- Kia Carnival ----
    {
        ReviewID: 1,
        CarID: 1,
        AccountID: 12,
        Rating: 5,
        Comment: "Amazing comfort! Perfect for business VIP transfers.",
        CreatedAt: "2025-01-12T10:30:00",
    },
    {
        ReviewID: 2,
        CarID: 1,
        AccountID: 5,
        Rating: 4,
        Comment: "Driver was professional. Car was clean and spacious.",
        CreatedAt: "2025-01-15T14:20:00",
    },

    // ---- Fortuner ----
    {
        ReviewID: 3,
        CarID: 2,
        AccountID: 2,
        Rating: 5,
        Comment: "SUV is powerful and smooth for mountain trips.",
        CreatedAt: "2025-02-01T09:15:00",
    },

    // ---- VinFast Lux A2 ----
    {
        ReviewID: 4,
        CarID: 3,
        AccountID: 9,
        Rating: 4,
        Comment: "Luxury sedan experience, good value.",
        CreatedAt: "2025-02-05T17:50:00",
    }
];
// =============================
// GROUP TOUR SCHEDULES BY TOUR ID
// =============================
export const tourSchedules = mockTourDetails.reduce((acc, detail) => {
    if (!acc[detail.TourID]) acc[detail.TourID] = [];
    acc[detail.TourID].push(detail);
    return acc;
}, {});
