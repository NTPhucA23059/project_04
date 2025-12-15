import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CarDetail from "./CarDetail";
import { fetchCarById } from "../../../services/customer/carService";
import api from "../../../services/api";

export default function CarDetailWrapper() {
    const { id } = useParams();
    const carId = Number(id);

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await fetchCarById(carId);
                setCar(res);
            } catch (err) {
                setError(err.message || "Không thể tải thông tin xe");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [carId]);

    if (loading) return <p className="p-10 text-center text-neutral-600">Đang tải xe...</p>;
    if (error) return <p className="p-10 text-center text-red-500">{error}</p>;
    if (!car) return <p className="p-10 text-center text-red-500">Car not found.</p>;

    // Convert relative URL to absolute URL
    const toAbsoluteUrl = (url) => {
        if (!url) return "";
        if (/^https?:\/\//.test(url)) return url;
        const base = (api.defaults.baseURL || "").replace(/\/$/, "");
        return `${base}/${url.replace(/^\/+/, "")}`;
    };

    // Map images (API: imageUrl) to structure CarGallery expects
    // Normalize image URLs to absolute URLs
    const images = (car.images || []).map((img) => {
        const imageUrl = img.imageUrl || img.ImageUrl || img.image || img.url;
        return {
            ImageID: img.imageID || img.ImageID,
            ImageUrl: toAbsoluteUrl(imageUrl),
        };
    }).filter((i) => i.ImageUrl);

    // Nếu không có images, thêm main image từ car object
    if (images.length === 0 && car.image) {
        images.push({
            ImageID: 0,
            ImageUrl: toAbsoluteUrl(car.image || car.imageUrl || car.ImageUrl),
        });
    }

    const type = car.carType || null;
    const reviews = []; // No API yet

    return (
        <CarDetail
            car={car}
            type={type}
            images={images}
            reviews={reviews}
        />
    );
}
