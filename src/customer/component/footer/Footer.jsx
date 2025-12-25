import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import payment1 from "../../../assets/img/payment/payment-1.png";
import payment2 from "../../../assets/img/payment/payment-2.png";
import payment3 from "../../../assets/img/payment/payment-3.png";
import payment4 from "../../../assets/img/payment/payment-4.png";
import payment5 from "../../../assets/img/payment/payment-5.png";


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
                    setMessage("Oke.");
                    formRef.current.reset();
                },
                () => {
                    setMessage("Error.");
                }
            );
    };

    return (
        <footer className="bg-primary-50 text-gray-800 mt-20 border-t w-full relative z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10">

                {/* LOGO + DESCRIPTION */}
                <div className="sm:col-span-2 md:col-span-1">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 font-[cursive]">Global Horizon</h2>
                    <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                        Discover amazing destinations and unforgettable travel experiences. 
                        Your journey starts here with Global Horizon.
                    </p>

                    {/* PAYMENT ICONS */}
                    <div className="flex space-x-4">
                        <img src={payment1} className="h-8" alt="pay1" />
                        <img src={payment2} className="h-8" alt="pay2" />
                        <img src={payment3} className="h-8" alt="pay3" />
                        <img src={payment4} className="h-8" alt="pay4" />
                        <img src={payment5} className="h-8" alt="pay5" />
                    </div>
                </div>

                {/* QUICK LINKS */}
                <div>
                    <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5">QUICK LINKS</h3>
                    <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                        <li><a href="/" className="hover:text-primary-600 transition-colors">Home</a></li>
                        <li><a href="/tours" className="hover:text-primary-600 transition-colors">Tours</a></li>
                        <li><a href="/contact" className="hover:text-primary-600 transition-colors">Contact</a></li>
                        <li><a href="#" className="hover:text-primary-600 transition-colors">FAQ</a></li>
                    </ul>
                </div>

                {/* ACCOUNT */}
                <div>
                    <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5">ACCOUNT</h3>
                    <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                        <li><a href="/profile" className="hover:text-primary-600 transition-colors">My Account</a></li>
                        <li><a href="/my-tour-bookings" className="hover:text-primary-600 transition-colors">My Bookings</a></li>
                        <li><a href="/my-car-bookings" className="hover:text-primary-600 transition-colors">Car Bookings</a></li>
                        <li><a href="/login" className="hover:text-primary-600 transition-colors">Login</a></li>
                    </ul>
                </div>

                {/* NEWSLETTER */}
                <div className="sm:col-span-2 md:col-span-1">
                    <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5">NEWSLETTER</h3>

                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="flex items-center justify-center md:justify-start bg-white rounded-full overflow-hidden shadow-sm max-w-sm mx-auto md:mx-0"
                    >
                        <input
                            type="email"
                            name="user_email"
                            placeholder="Enter your email"
                            required
                            className="flex-1 px-4 py-2 text-gray-700 text-sm placeholder-gray-400 focus:outline-none"
                        />

                        <input type="hidden" name="title" value="Newsletter Subscription" />
                        <input type="hidden" name="message" value="Customer has subscribed to receive promotional news." />
                        <input
                            type="hidden"
                            name="time"
                            value={new Date().toLocaleString("en-US")}
                        />

                        <button
                            type="submit"
                            className="bg-primary-400 hover:bg-primary-500 text-green-900 font-semibold px-5 py-2 text-sm transition-colors duration-200"
                        >
                            Send
                        </button>
                    </form>

                    {message && (
                        <p className="text-sm text-green-600 mt-3">{message}</p>
                    )}

                    {/* SOCIAL ICONS */}
                    <div className="flex space-x-4 mt-6">
                        {[Facebook, Twitter, Youtube, Instagram, Mail].map((Icon, i) => (
                            <div
                                key={i}
                                className="w-10 h-10 flex items-center justify-center bg-white border border-primary-300 text-primary-600 rounded-full hover:bg-primary-500 hover:text-white transition cursor-pointer"
                            >
                                <Icon size={20} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t py-4 px-4 text-center text-xs sm:text-sm text-gray-600">
                Copyright © {new Date().getFullYear()} All rights reserved |
                Made with ❤️ by <span className="font-bold">Global Horizon</span>
            </div>
        </footer>

    );
}
