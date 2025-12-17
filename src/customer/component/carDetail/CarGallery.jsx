import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import api from "../../../services/api";

// Convert relative URL to absolute URL with better handling
const toAbsoluteUrl = (url) => {
    if (!url || typeof url !== 'string') return "https://placehold.co/800x500?text=Car+Image";
    
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

const getUrl = (img) => {
    if (!img) return "https://placehold.co/800x500?text=Car+Image";
    const url = img?.ImageUrl || img?.imageUrl || img?.url || img?.image || (typeof img === 'string' ? img : null);
    return toAbsoluteUrl(url) || "https://placehold.co/800x500?text=Car+Image";
};

const handleImageError = (e) => {
    e.target.src = "https://placehold.co/800x500?text=Car+Image";
    e.target.onerror = null; // Prevent infinite loop
};

export default function CarGallery({ images = [] }) {
    const safeImages = images.length > 0 ? images : [{ ImageID: 0, ImageUrl: "https://placehold.co/800x500" }];
    const [currentIndex, setCurrentIndex] = useState(0);
    const main = safeImages[currentIndex];

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentIndex, safeImages.length]);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
    };

    const goToImage = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div>
            {/* MAIN IMAGE WITH NAVIGATION */}
            <div className="relative group">
                <img
                    src={getUrl(main)}
                    alt="Car main image"
                    className="w-full h-[430px] object-cover rounded-xl shadow bg-neutral-100"
                    onError={handleImageError}
                    loading="eager"
                />
                
                {/* Navigation Buttons - only show if more than 1 image */}
                {safeImages.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            aria-label="Previous image"
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-neutral-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            aria-label="Next image"
                        >
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                            {currentIndex + 1} / {safeImages.length}
                        </div>
                    </>
                )}
            </div>

            {/* GALLERY THUMBNAILS - Scrollable if many images */}
            {safeImages.length > 1 && (
                <div className="mt-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-neutral-100">
                        {safeImages.map((img, index) => (
                            <img
                                key={img.ImageID || index}
                                src={getUrl(img)}
                                alt={`Car gallery image ${index + 1}`}
                                onClick={() => goToImage(index)}
                                className={`min-w-[120px] h-24 w-24 object-cover rounded-lg cursor-pointer border-2 bg-neutral-100 flex-shrink-0 transition-all duration-200
                                    ${currentIndex === index 
                                        ? "border-orange-600 ring-2 ring-orange-200 scale-105" 
                                        : "border-transparent hover:border-neutral-300 hover:scale-105"
                                    }
                                `}
                                onError={handleImageError}
                                loading="lazy"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
