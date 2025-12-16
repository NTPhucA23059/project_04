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
            bg: "bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-50"
        },
        {
            title: "Asia Tours",
            items: "40 tours",
            image: cat3,
            bg: "bg-gradient-to-br from-purple-200 via-indigo-100 to-blue-50"
        },
        {
            title: "Resort & Relax Tours",
            items: "18 tours",
            image: cat4,
            bg: "bg-gradient-to-br from-pink-200 via-rose-100 to-red-50"
        },
        {
            title: "Vietnam Domestic Tours",
            items: "60 tours",
            image: cat5,
            bg: "bg-gradient-to-br from-sky-200 via-blue-100 to-cyan-50"
        }
    ];

    return (
        <section className="w-full px-4 lg:px-8 xl:px-16 py-12 lg:py-16 mt-[30px]">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    {/* LEFT LARGE ITEM */}
                    <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-200 via-amber-100 to-yellow-50 category-card shadow-xl hover:shadow-2xl transition-all duration-500 group">
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0">
                            <img 
                                src={cat1} 
                                alt="World Travel" 
                                className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                        </div>

                        {/* Content */}
                        <div className="relative h-full flex items-center p-8 lg:p-12 z-10">
                            <div className="max-w-md">
                                <div className="mb-6">
                                    <span className="inline-block px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-primary-600 mb-4 shadow-md">
                                        ✈️ Explore the World
                                    </span>
                                </div>
                                <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-4 leading-tight">
                                    World <span className="text-primary-600">Travel</span>
                                </h1>
                                <p className="text-neutral-700 text-lg mb-8 leading-relaxed">
                                    Discover amazing destinations and unforgettable travel experiences around the globe.
                                </p>
                                <button className="group/btn inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                                    <span>EXPLORE NOW</span>
                                    <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT GRID */}
                    <div className="grid grid-cols-2 gap-4 lg:gap-6">
                        {categories.map((cat, i) => (
                            <div 
                                key={i} 
                                className={`category-card h-[240px] lg:h-[290px] rounded-xl overflow-hidden ${cat.bg} shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer`}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <img 
                                        src={cat.image} 
                                        alt={cat.title}
                                        className="w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                                </div>

                                {/* Content */}
                                <div className="relative h-full flex flex-col justify-between p-5 lg:p-6 z-10">
                                    <div>
                                        <h4 className="text-lg lg:text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                                            {cat.title}
                                        </h4>
                                        <p className="text-neutral-600 text-sm lg:text-base font-medium">
                                            {cat.items}
                                        </p>
                                    </div>
                                    <button className="inline-flex items-center gap-2 text-sm lg:text-base font-semibold text-primary-600 hover:text-primary-700 mt-4 group-hover:gap-3 transition-all">
                                        <span>BOOK NOW</span>
                                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
