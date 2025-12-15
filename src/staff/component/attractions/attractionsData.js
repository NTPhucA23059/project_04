// Dữ liệu cứng các địa điểm tham quan theo tỉnh thành
export const attractionsData = [
  // Hồ Chí Minh
  { AttractionID: 1, CityID: 1, Name: "Bến Nhà Rồng", Description: "Bảo tàng Hồ Chí Minh - nơi Bác Hồ ra đi tìm đường cứu nước", Address: "Số 1 Nguyễn Tất Thành, Phường 12, Quận 4, TP.HCM", TicketPrice: 30000, Rating: 4.3, ImageUrl: "/images/ben-nha-rong.jpg", Status: 1 },
  { AttractionID: 2, CityID: 1, Name: "Dinh Độc Lập", Description: "Di tích lịch sử quan trọng, nơi kết thúc chiến tranh Việt Nam", Address: "135 Nam Kỳ Khởi Nghĩa, Phường Bến Thành, Quận 1, TP.HCM", TicketPrice: 40000, Rating: 4.5, ImageUrl: "/images/dinh-doc-lap.jpg", Status: 1 },
  { AttractionID: 3, CityID: 1, Name: "Chợ Bến Thành", Description: "Chợ truyền thống nổi tiếng nhất Sài Gòn", Address: "Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM", TicketPrice: 0, Rating: 4.2, ImageUrl: "/images/cho-ben-thanh.jpg", Status: 1 },
  { AttractionID: 4, CityID: 1, Name: "Nhà thờ Đức Bà", Description: "Nhà thờ Công giáo cổ kính, biểu tượng của Sài Gòn", Address: "Công xã Paris, Phường Bến Nghé, Quận 1, TP.HCM", TicketPrice: 0, Rating: 4.6, ImageUrl: "/images/nha-tho-duc-ba.jpg", Status: 1 },
  { AttractionID: 5, CityID: 1, Name: "Bảo tàng Chứng tích Chiến tranh", Description: "Bảo tàng về chiến tranh Việt Nam", Address: "28 Võ Văn Tần, Phường 6, Quận 3, TP.HCM", TicketPrice: 40000, Rating: 4.4, ImageUrl: "/images/bao-tang-chien-tranh.jpg", Status: 1 },

  // Hà Nội
  { AttractionID: 6, CityID: 2, Name: "Văn Miếu - Quốc Tử Giám", Description: "Trường đại học đầu tiên của Việt Nam", Address: "58 Quốc Tử Giám, Đống Đa, Hà Nội", TicketPrice: 30000, Rating: 4.5, ImageUrl: "/images/van-mieu.jpg", Status: 1 },
  { AttractionID: 7, CityID: 2, Name: "Hồ Hoàn Kiếm", Description: "Hồ nước nổi tiếng ở trung tâm Hà Nội", Address: "Hoàn Kiếm, Hà Nội", TicketPrice: 0, Rating: 4.4, ImageUrl: "/images/ho-hoan-kiem.jpg", Status: 1 },
  { AttractionID: 8, CityID: 2, Name: "Lăng Chủ tịch Hồ Chí Minh", Description: "Nơi an nghỉ của Chủ tịch Hồ Chí Minh", Address: "Hùng Vương, Ba Đình, Hà Nội", TicketPrice: 0, Rating: 4.7, ImageUrl: "/images/lang-bac.jpg", Status: 1 },
  { AttractionID: 9, CityID: 2, Name: "Phố cổ Hà Nội", Description: "Khu phố cổ với 36 phố phường", Address: "Hoàn Kiếm, Hà Nội", TicketPrice: 0, Rating: 4.3, ImageUrl: "/images/pho-co-ha-noi.jpg", Status: 1 },
  { AttractionID: 10, CityID: 2, Name: "Chùa Một Cột", Description: "Ngôi chùa có kiến trúc độc đáo", Address: "Chùa Một Cột, Đội Cấn, Ba Đình, Hà Nội", TicketPrice: 0, Rating: 4.2, ImageUrl: "/images/chua-mot-cot.jpg", Status: 1 },

  // Đà Nẵng
  { AttractionID: 11, CityID: 3, Name: "Bà Nà Hills", Description: "Khu du lịch nghỉ dưỡng trên núi với cáp treo dài nhất thế giới", Address: "Hòa Vang, Đà Nẵng", TicketPrice: 900000, Rating: 4.5, ImageUrl: "/images/ba-na-hills.jpg", Status: 1 },
  { AttractionID: 12, CityID: 3, Name: "Cầu Rồng", Description: "Cây cầu biểu tượng của Đà Nẵng với hình rồng phun lửa", Address: "Quận Sơn Trà, Đà Nẵng", TicketPrice: 0, Rating: 4.8, ImageUrl: "/images/cau-rong.jpg", Status: 1 },
  { AttractionID: 13, CityID: 3, Name: "Bãi biển Mỹ Khê", Description: "Một trong những bãi biển đẹp nhất thế giới", Address: "Quận Sơn Trà, Đà Nẵng", TicketPrice: 0, Rating: 4.6, ImageUrl: "/images/bai-bien-my-khe.jpg", Status: 1 },
  { AttractionID: 14, CityID: 3, Name: "Ngũ Hành Sơn", Description: "Núi đá vôi với nhiều hang động và chùa chiền", Address: "Quận Ngũ Hành Sơn, Đà Nẵng", TicketPrice: 40000, Rating: 4.4, ImageUrl: "/images/ngu-hanh-son.jpg", Status: 1 },
  { AttractionID: 15, CityID: 3, Name: "Bảo tàng Điêu khắc Chăm", Description: "Bảo tàng trưng bày nghệ thuật Chăm Pa", Address: "2 Tháng 9, Hải Châu, Đà Nẵng", TicketPrice: 60000, Rating: 4.3, ImageUrl: "/images/bao-tang-cham.jpg", Status: 1 },

  // Hải Phòng
  { AttractionID: 16, CityID: 4, Name: "Đảo Cát Bà", Description: "Đảo lớn nhất trong quần đảo Cát Bà", Address: "Huyện Cát Hải, Hải Phòng", TicketPrice: 0, Rating: 4.5, ImageUrl: "/images/cat-ba.jpg", Status: 1 },
  { AttractionID: 17, CityID: 4, Name: "Vịnh Lan Hạ", Description: "Vịnh biển đẹp với nhiều đảo đá vôi", Address: "Huyện Cát Hải, Hải Phòng", TicketPrice: 0, Rating: 4.6, ImageUrl: "/images/vinh-lan-ha.jpg", Status: 1 },

  // Cần Thơ
  { AttractionID: 18, CityID: 5, Name: "Chợ nổi Cái Răng", Description: "Chợ nổi trên sông lớn nhất Đồng bằng sông Cửu Long", Address: "Quận Cái Răng, Cần Thơ", TicketPrice: 0, Rating: 4.4, ImageUrl: "/images/cho-noi-cai-rang.jpg", Status: 1 },
  { AttractionID: 19, CityID: 5, Name: "Chùa Ông", Description: "Ngôi chùa cổ của người Hoa", Address: "Quận Ninh Kiều, Cần Thơ", TicketPrice: 0, Rating: 4.2, ImageUrl: "/images/chua-ong.jpg", Status: 1 },

  // Quảng Ninh (CityID: 47)
  { AttractionID: 20, CityID: 47, Name: "Vịnh Hạ Long", Description: "Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi", Address: "Vịnh Hạ Long, Quảng Ninh", TicketPrice: 290000, Rating: 4.8, ImageUrl: "/images/vinh-ha-long.jpg", Status: 1 },
  { AttractionID: 21, CityID: 47, Name: "Đảo Cô Tô", Description: "Đảo đẹp với bãi biển hoang sơ", Address: "Huyện Cô Tô, Quảng Ninh", TicketPrice: 0, Rating: 4.5, ImageUrl: "/images/dao-co-to.jpg", Status: 1 },

  // Lào Cai (CityID: 34)
  { AttractionID: 22, CityID: 34, Name: "Sa Pa", Description: "Thị trấn nghỉ dưỡng trên núi, nổi tiếng với ruộng bậc thang", Address: "Huyện Sa Pa, Lào Cai", TicketPrice: 0, Rating: 4.7, ImageUrl: "/images/sa-pa.jpg", Status: 1 },
  { AttractionID: 23, CityID: 34, Name: "Fansipan", Description: "Đỉnh núi cao nhất Đông Dương", Address: "Huyện Sa Pa, Lào Cai", TicketPrice: 800000, Rating: 4.6, ImageUrl: "/images/fansipan.jpg", Status: 1 },

  // Lâm Đồng (CityID: 35)
  { AttractionID: 24, CityID: 35, Name: "Đà Lạt", Description: "Thành phố ngàn hoa, thành phố mộng mơ", Address: "Đà Lạt, Lâm Đồng", TicketPrice: 0, Rating: 4.7, ImageUrl: "/images/da-lat.jpg", Status: 1 },
  { AttractionID: 25, CityID: 35, Name: "Hồ Xuân Hương", Description: "Hồ nước đẹp ở trung tâm Đà Lạt", Address: "Trung tâm Đà Lạt, Lâm Đồng", TicketPrice: 0, Rating: 4.4, ImageUrl: "/images/ho-xuan-huong.jpg", Status: 1 },
  { AttractionID: 26, CityID: 35, Name: "Thung lũng Tình Yêu", Description: "Khu du lịch lãng mạn", Address: "Đà Lạt, Lâm Đồng", TicketPrice: 100000, Rating: 4.3, ImageUrl: "/images/thung-lung-tinh-yeu.jpg", Status: 1 },

  // Quảng Nam (CityID: 45)
  { AttractionID: 27, CityID: 45, Name: "Phố cổ Hội An", Description: "Phố cổ được UNESCO công nhận di sản thế giới", Address: "Hội An, Quảng Nam", TicketPrice: 120000, Rating: 4.8, ImageUrl: "/images/hoi-an.jpg", Status: 1 },
  { AttractionID: 28, CityID: 45, Name: "Thánh địa Mỹ Sơn", Description: "Khu đền tháp Chăm Pa cổ", Address: "Huyện Duy Xuyên, Quảng Nam", TicketPrice: 150000, Rating: 4.5, ImageUrl: "/images/my-son.jpg", Status: 1 },

  // Thừa Thiên Huế (CityID: 55)
  { AttractionID: 29, CityID: 55, Name: "Đại Nội Huế", Description: "Kinh thành Huế, di sản văn hóa thế giới", Address: "Thành phố Huế, Thừa Thiên Huế", TicketPrice: 200000, Rating: 4.6, ImageUrl: "/images/dai-noi-hue.jpg", Status: 1 },
  { AttractionID: 30, CityID: 55, Name: "Lăng Tự Đức", Description: "Lăng tẩm đẹp nhất của các vua Nguyễn", Address: "Thành phố Huế, Thừa Thiên Huế", TicketPrice: 150000, Rating: 4.5, ImageUrl: "/images/lang-tu-duc.jpg", Status: 1 },

  // Khánh Hòa (CityID: 32)
  { AttractionID: 31, CityID: 32, Name: "Nha Trang", Description: "Thành phố biển nổi tiếng", Address: "Nha Trang, Khánh Hòa", TicketPrice: 0, Rating: 4.6, ImageUrl: "/images/nha-trang.jpg", Status: 1 },
  { AttractionID: 32, CityID: 32, Name: "Vinpearl Land", Description: "Khu vui chơi giải trí trên đảo", Address: "Đảo Hòn Tre, Nha Trang", TicketPrice: 800000, Rating: 4.4, ImageUrl: "/images/vinpearl.jpg", Status: 1 },

  // Kiên Giang (CityID: 33)
  { AttractionID: 33, CityID: 33, Name: "Đảo Phú Quốc", Description: "Đảo lớn nhất Việt Nam, thiên đường du lịch", Address: "Phú Quốc, Kiên Giang", TicketPrice: 0, Rating: 4.7, ImageUrl: "/images/phu-quoc.jpg", Status: 1 },
  { AttractionID: 34, CityID: 33, Name: "Bãi Sao Phú Quốc", Description: "Bãi biển đẹp với cát trắng mịn", Address: "Phú Quốc, Kiên Giang", TicketPrice: 0, Rating: 4.6, ImageUrl: "/images/bai-sao.jpg", Status: 1 },

  // Ninh Bình (CityID: 40)
  { AttractionID: 35, CityID: 40, Name: "Tràng An", Description: "Khu du lịch sinh thái, di sản thế giới", Address: "Huyện Hoa Lư, Ninh Bình", TicketPrice: 250000, Rating: 4.7, ImageUrl: "/images/trang-an.jpg", Status: 1 },
  { AttractionID: 36, CityID: 40, Name: "Tam Cốc - Bích Động", Description: "Hang động đẹp, được mệnh danh Vịnh Hạ Long trên cạn", Address: "Huyện Hoa Lư, Ninh Bình", TicketPrice: 200000, Rating: 4.6, ImageUrl: "/images/tam-coc.jpg", Status: 1 },

  // Quảng Bình (CityID: 44)
  { AttractionID: 37, CityID: 44, Name: "Động Phong Nha", Description: "Hang động đẹp nhất thế giới", Address: "Huyện Bố Trạch, Quảng Bình", TicketPrice: 150000, Rating: 4.8, ImageUrl: "/images/phong-nha.jpg", Status: 1 },
  { AttractionID: 38, CityID: 44, Name: "Hang Sơn Đoòng", Description: "Hang động lớn nhất thế giới", Address: "Vườn Quốc gia Phong Nha - Kẻ Bàng, Quảng Bình", TicketPrice: 0, Rating: 5.0, ImageUrl: "/images/son-doong.jpg", Status: 1 },

  // Bình Thuận (CityID: 17)
  { AttractionID: 39, CityID: 17, Name: "Mũi Né", Description: "Khu du lịch biển nổi tiếng với đồi cát", Address: "Phan Thiết, Bình Thuận", TicketPrice: 0, Rating: 4.5, ImageUrl: "/images/mui-ne.jpg", Status: 1 },
  { AttractionID: 40, CityID: 17, Name: "Đồi cát bay", Description: "Đồi cát đỏ độc đáo", Address: "Mũi Né, Bình Thuận", TicketPrice: 20000, Rating: 4.4, ImageUrl: "/images/doi-cat-bay.jpg", Status: 1 },
].map((attr, index) => ({
  ...attr,
  AttractionID: index + 1,
  CreatedAt: new Date().toISOString(),
  UpdatedAt: new Date().toISOString(),
}));


