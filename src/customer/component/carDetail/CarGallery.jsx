import { useState } from "react";
import api from "../../../services/api";

// Convert relative URL to absolute URL
const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}/${url.replace(/^\/+/, "")}`;
};

const getUrl = (img) => {
    const url = img?.ImageUrl || img?.imageUrl || img?.url || img?.image || img;
    return toAbsoluteUrl(url);
};

export default function CarGallery({ images = [] }) {
    const safeImages = images.length > 0 ? images : [{ ImageID: 0, ImageUrl: "https://placehold.co/800x500" }];
    const [main, setMain] = useState(safeImages[0]);

    return (
        <div>
            {/* MAIN IMAGE */}
            <img
                src={getUrl(main)}
                className="w-full h-[430px] object-cover rounded-xl shadow"
            />

            {/* GALLERY THUMBNAILS */}
            <div className="grid grid-cols-3 gap-4 mt-4">
                {safeImages.slice(0, 3).map((img) => (
                    <img
                        key={img.ImageID || getUrl(img)}
                        src={getUrl(img)}
                        onClick={() => setMain(img)}
                        className={`h-36 w-full object-cover rounded-lg cursor-pointer border
                            ${main.ImageID === img.ImageID ? "border-orange-600" : "border-transparent"}
                        `}
                    />
                ))}
            </div>
        </div>
    );
}
