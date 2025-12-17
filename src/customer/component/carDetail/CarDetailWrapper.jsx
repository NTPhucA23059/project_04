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

    // Convert relative URL to absolute URL with better handling
    const toAbsoluteUrl = (url) => {
        if (!url || typeof url !== 'string') return null;
        
        // Already absolute URL
        if (/^https?:\/\//.test(url)) return url;
        
        // If it's already a full path starting with /, keep it
        if (url.startsWith('/')) {
            const base = (api.defaults.baseURL || window.location.origin).replace(/\/$/, "");
            return `${base}${url}`;
        }
        
        // Relative path - need to add base URL
        const base = (api.defaults.baseURL || window.location.origin).replace(/\/$/, "");
        const cleanUrl = url.replace(/^\/+/, "");
        return `${base}/${cleanUrl}`;
    };

    // Map images (API: imageUrl) to structure CarGallery expects
    // Normalize image URLs to absolute URLs
    let images = [];
    
    // First, try to get images from car.images array
    if (car.images && car.images.length > 0) {
        images = car.images
            .map((img) => {
                const imageUrl = img.imageUrl || img.ImageUrl || img.image || img.url;
                const absoluteUrl = toAbsoluteUrl(imageUrl);
                if (!absoluteUrl) return null;
                
                return {
                    ImageID: img.imageID || img.ImageID || img.imageId || 0,
                    ImageUrl: absoluteUrl,
                };
            })
            .filter((i) => i && i.ImageUrl);
    }
    
    // If no images from array, try main image from car object
    if (images.length === 0) {
        const mainImageUrl = car.image || car.imageUrl || car.ImageUrl || car.Image || car.MainImage;
        if (mainImageUrl) {
            const absoluteUrl = toAbsoluteUrl(mainImageUrl);
            if (absoluteUrl) {
                images.push({
                    ImageID: 0,
                    ImageUrl: absoluteUrl,
                });
            }
        }
    }
    
    // If still no images, use placeholder
    if (images.length === 0) {
        images.push({
            ImageID: 0,
            ImageUrl: "https://placehold.co/800x500?text=Car+Image",
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
