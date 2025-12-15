export default function ContactPage() {
    return (
        <section className="py-16 bg-white mt-[50px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* LEFT CONTENT */}
                <div>
                    {/* Breadcrumb */}
                    <p className="text-sm text-neutral-500 mb-6">
                        <a href="/" className="cursor-pointer hover:text-primary-600">Home</a> › 
                        <span className="text-primary-600"> Contact</span>
                    </p>

                    {/* Contact Info */}
                    <h2 className="text-3xl font-bold text-neutral-900 mb-6">Contact Info</h2>

                    {/* Address */}
                    <div className="mb-5">
                        <h4 className="font-semibold text-neutral-700 text-lg">📍 Address</h4>
                        <p className="text-neutral-600">160 Pennsylvania Ave NW, Washington, Castle, PA 16101-5161</p>
                    </div>

                    {/* Phone */}
                    <div className="mb-5">
                        <h4 className="font-semibold text-neutral-700 text-lg">📞 Phone</h4>
                        <p className="text-neutral-600">125-711-811 &nbsp; | &nbsp; 125-668-886</p>
                    </div>

                    {/* Support */}
                    <div className="mb-10">
                        <h4 className="font-semibold text-neutral-700 text-lg">🎧 Support</h4>
                        <p className="text-neutral-600">Support.photography@gmail.com</p>
                    </div>

                    {/* Contact Form */}
                    <h3 className="font-semibold tracking-wide text-neutral-900 text-xl mb-4">
                        Send Message
                    </h3>

                    <form className="space-y-4">
                        <input
                            type="text"
                            placeholder="Name"
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                        />

                        <input
                            type="text"
                            placeholder="Website"
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                        />

                        <textarea
                            rows="5"
                            placeholder="Message"
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                        ></textarea>

                        <button
                            type="submit"
                            className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-full shadow hover:bg-red-700 transition"
                        >
                            SEND MESSAGE
                        </button>
                    </form>
                </div>

                {/* RIGHT — GOOGLE MAP */}
                <div className="w-full h-[600px] rounded-xl overflow-hidden shadow">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3020.181675984917!2d-74.11212252402413!3d41.03120437125869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2f6ba6f3f96f3%3A0xdaa3ea0c2e0e1f7c!2sSaddle%20River%2C%20NJ%2007458%2C%20USA!5e0!3m2!1sen!2sus!4v1700000000000"
                        width="100%"
                        height="100%"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
        </section>
    );
}
