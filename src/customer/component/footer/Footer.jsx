"use client";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

export default function Footer() {
    const formRef = useRef(null);
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formRef.current) return;

        emailjs
            .sendForm(
                "service_tbam42s",
                "template_k7q10ei",
                formRef.current,
                "yf5wz-8URyFY_9XM_"
            )
            .then(
                () => {
                    setMessage(" Cảm ơn bạn! Email đã được gửi thành công.");
                    formRef.current.reset();
                },
                (emailjsError) => {
                    console.error("EmailJS error:", emailjsError);
                    alert("Chi tiết lỗi: " + JSON.stringify(emailjsError));
                    setMessage("❌ Gửi email thất bại. Vui lòng thử lại!");
                }
            );
    };

    return (
        <footer className="bg-primary-900 text-gray-100 mt-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">

                {/* --- Cột 1: Giới thiệu --- */}
                <div className="text-center md:text-left">
                    <h3 className="text-accent-400 text-lg font-semibold mb-4">
                        Văn Phòng Phẩm T&Đ
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-300">
                        Cung cấp dụng cụ học tập, văn phòng phẩm và thiết bị văn phòng chất lượng cao.
                        Hơn 10 năm đồng hành cùng hàng ngàn khách hàng trên toàn quốc.
                    </p>
                    <div className="flex justify-center md:justify-start space-x-4 mt-5">
                        <a href="#" className="hover:text-accent-300 transition">
                            <Facebook size={20} />
                        </a>
                        <a href="#" className="hover:text-accent-300 transition">
                            <Instagram size={20} />
                        </a>
                        <a href="mailto:lienhe@vandphongpham.vn" className="hover:text-accent-300 transition">
                            <Mail size={20} />
                        </a>
                    </div>
                </div>

                {/* --- Cột 2: Hỗ trợ khách hàng --- */}
                <div className="text-center md:text-left">
                    <h3 className="text-accent-400 text-lg font-semibold mb-4">Hỗ trợ</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/about" className="hover:text-accent-300 transition">Giới thiệu</a></li>
                        <li><a href="#" className="hover:text-accent-300 transition">Chính sách đổi trả</a></li>
                        <li><a href="#" className="hover:text-accent-300 transition">Giao hàng & Thanh toán</a></li>
                        <li><a href="#" className="hover:text-accent-300 transition">Bảo hành</a></li>
                        <li><a href="#" className="hover:text-accent-300 transition">Câu hỏi thường gặp (FAQ)</a></li>
                        <li><a href="/contact" className="hover:text-accent-300 transition">Liên hệ</a></li>
                    </ul>
                </div>

                {/* --- Cột 3: Thông tin liên hệ --- */}
                <div className="text-center md:text-left">
                    <h3 className="text-accent-400 text-lg font-semibold mb-4">Liên hệ</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex justify-center md:justify-start items-start gap-2">
                            <MapPin size={18} className="mt-1 text-accent-400" />
                            <span>1 Đ. Lý Tự Trọng, Thới Bình, Ninh Kiều, Cần Thơ</span>
                        </li>
                        <li className="flex justify-center md:justify-start items-start gap-2">
                            <Phone size={18} className="mt-1 text-accent-400" />
                            <span>Hotline: 0901 234 567</span>
                        </li>
                        <li className="flex justify-center md:justify-start items-start gap-2">
                            <Mail size={18} className="mt-1 text-accent-400" />
                            <span>Email: lienhe@phuc</span>
                        </li>
                    </ul>
                </div>

                {/* --- Cột 4: Đăng ký nhận tin --- */}
                <div className="text-center md:text-left">
                    <h3 className="text-accent-400 text-lg font-semibold mb-4">
                        Nhận tin khuyến mãi
                    </h3>
                    <p className="text-sm mb-3 text-gray-300">
                        Đăng ký để nhận thông tin ưu đãi & sản phẩm mới mỗi tuần.
                    </p>

                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="flex items-center justify-center md:justify-start bg-white rounded-full overflow-hidden shadow-sm max-w-sm mx-auto md:mx-0"
                    >
                        {/* Người dùng chỉ nhập email */}
                        <input
                            type="email"
                            name="user_email"
                            placeholder="Nhập email của bạn"
                            required
                            className="flex-1 px-4 py-2 text-gray-700 text-sm placeholder-gray-400 focus:outline-none"
                        />

                        {/* Các trường ẩn tự động */}
                        <input type="hidden" name="title" value="Đăng ký nhận tin khuyến mãi" />
                        <input type="hidden" name="message" value="Khách hàng đã đăng ký nhận tin khuyến mãi mới." />
                        <input
                            type="hidden"
                            name="time"
                            value={new Date().toLocaleString("vi-VN")}
                        />

                        <button
                            type="submit"
                            className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold px-5 py-2 text-sm transition-colors duration-200"
                        >
                            Gửi
                        </button>
                    </form>

                    {message && <p className="text-xs text-accent-300 mt-3">{message}</p>}

                    <p className="text-xs text-gray-400 mt-3">
                        Bằng việc đăng ký, bạn đồng ý với{" "}
                        <a href="#" className="underline hover:text-accent-300">
                            Chính sách bảo mật
                        </a>{" "}
                        của chúng tôi.
                    </p>
                </div>
            </div>

            {/* --- Dòng bản quyền --- */}
            <div className="border-t border-primary-800 mt-8 py-4 text-center text-sm text-gray-300 px-4">
                © {new Date().getFullYear()}{" "}
                <span className="text-accent-400 font-medium">Tour du lịch</span> · Mọi quyền được bảo lưu
            </div>
        </footer>
    );
}
