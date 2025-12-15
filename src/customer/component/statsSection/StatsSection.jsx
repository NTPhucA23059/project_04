import StatsCarousel from "./StatsCarousel";


export default function StatsSection() {
    return (
        <section className="w-full py-20 bg-neutral-50 mt-[-20px]">

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">

                {/* LEFT IMAGE */}
                <div className="w-full h-full">
                    <StatsCarousel />
                </div>


                {/* RIGHT CONTENT */}
                <div>
                    <p className="text-primary-600 font-semibold mb-3">
                        Travel & Car Rental Service
                    </p>

                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight mb-6">
                        Your Trusted Partner<br />
                        for Tours & Transportation
                    </h2>

                    <p className="text-neutral-700 mb-10 leading-relaxed">
                        We provide high-quality tour services and professional car rental options
                        across Vietnam. Whether you are traveling with family, partners, or in a group,
                        our team guarantees safe, comfortable and reliable service on every journey.
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-3xl font-extrabold text-primary-600">500+</p>
                            <p className="text-neutral-700">Tours completed</p>
                        </div>

                        <div>
                            <p className="text-3xl font-extrabold text-primary-600">1,200+</p>
                            <p className="text-neutral-700">Car rental trips</p>
                        </div>

                        <div>
                            <p className="text-3xl font-extrabold text-primary-600">20,000+</p>
                            <p className="text-neutral-700">Satisfied customers</p>
                        </div>

                        <div>
                            <p className="text-3xl font-extrabold text-primary-600">98%</p>
                            <p className="text-neutral-700">Customer satisfaction</p>
                        </div>
                    </div>
                </div>


            </div>
        </section>
    );
}
