import {
    CarGallery,
    CarInfo,

    CarPricing,
    CarReview
} from "../carDetail";

export default function CarDetail({ car, type, images, reviews }) {
    return (
        <div className=" px-4 py-10 mt-[50px] grid grid-cols-1 lg:grid-cols-2 gap-12">

            <div>
                <CarGallery images={images} />
            </div>

            <div className="space-y-8">

                <CarInfo car={car} type={type} reviews={reviews} />

                <CarPricing car={car} />

            </div>

            <div className="lg:col-span-2 mt-14">

                <div className="mt-12">
                    <CarReview reviews={reviews} />
                </div>
            </div>

        </div>
    );
}
