import "./heroSection.css";

import cat1 from "../../../assets/img/categories/category-1.jpg";
import cat2 from "../../../assets/img/categories/category-2.jpg";
import cat3 from "../../../assets/img/categories/category-3.jpg";
import cat4 from "../../../assets/img/categories/category-4.jpg";
import cat5 from "../../../assets/img/categories/category-5.jpg";

export default function HeroSection() {
    const categories = [
        {
            title: "Europe Tours",
            items: "25 tours",
            image: cat2,
            bg: "bg-[#bae8d8]"
        },
        {
            title: "Asia Tours",
            items: "40 tours",
            image: cat3,
            bg: "bg-[#d8d2ff]"
        },
        {
            title: "Resort & Relax Tours",
            items: "18 tours",
            image: cat4,
            bg: "bg-[#ffd6de]"
        },
        {
            title: "Vietnam Domestic Tours",
            items: "60 tours",
            image: cat5,
            bg: "bg-[#d0eaff]"
        }
    ];

    return (
        <section className="w-full px-4 lg:px-0 py-10 mt-[30px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 margin-top-60">

                {/* LEFT LARGE ITEM */}
                <div className="relative h-[500px] p-10 flex items-center bg-[#fcded0] category-card">
                    <img src={cat1} alt="" />

                    <div className="max-w-md relative z-10">
                        <h1 className="text-5xl font-[Cookie] mb-4">World Travel</h1>
                        <p className="text-gray-600 mb-6">
                            Discover amazing destinations and unforgettable travel experiences.
                        </p>
                        <button className="font-semibold border-b-2 border-red-500 hover:text-red-500 transition">
                            EXPLORE NOW
                        </button>
                    </div>
                </div>

                {/* RIGHT GRID */}
                <div className="grid grid-cols-2 gap-4">
                    {categories.map((cat, i) => (
                        <div key={i} className={`category-card h-[240px] p-6 ${cat.bg}`}>
                            <img src={cat.image} alt={cat.title} />

                            <div className="relative z-10">
                                <h4 className="text-xl font-semibold">{cat.title}</h4>
                                <p className="text-gray-600 text-sm">{cat.items}</p>
                                <button className="mt-2 text-sm font-semibold border-b-2 border-red-500 hover:text-red-500 transition">
                                    BOOK NOW
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
