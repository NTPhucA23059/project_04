import { FaStar } from "react-icons/fa";

const testimonials = [
  {
    id: 1,
    name: "Nguyen Hoang Minh",
    avatar: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    comment:
      "Our family had an amazing trip to Phu Quoc! Excellent service and a very friendly tour guide. We were extremely satisfied.",
  },
  {
    id: 2,
    name: "Tran Quynh Anh",
    avatar: "https://i.pravatar.cc/150?img=32",
    rating: 4,
    comment:
      "The Da Nang – Hoi An tour was a wonderful experience. The itinerary was comfortable, the food was delicious, and the hotel was clean.",
  },
  {
    id: 3,
    name: "Le Thanh Nam",
    avatar: "https://i.pravatar.cc/150?img=45",
    rating: 5,
    comment:
      "I booked a tour to South Korea and everything was perfect. Great price, fast customer support. Will definitely come back again!",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-neutral-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-primary-700 text-center mb-10">
          What Our Customers Say
        </h2>

        {/* GRID REVIEWS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition"
            >
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-full border"
                />

                <div>
                  <h4 className="font-semibold text-neutral-900">
                    {item.name}
                  </h4>

                  {/* Rating Stars */}
                  <div className="flex text-yellow-500">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment */}
              <p className="mt-4 text-neutral-600 leading-relaxed">
                {item.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
