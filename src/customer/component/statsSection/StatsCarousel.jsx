import React from "react";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";

import img1 from "../../../assets/img/tour/Halong-Bay-Vietnam-08.jpg";
import img2 from "../../../assets/img/tour/xethue.jpg";

const statsCarouselImages = [
    { image: img1 },
    { image: img2 },
];

export default function StatsCarousel() {
    const items = statsCarouselImages.map((item, index) => (
        <img
            key={index}
            src={item.image}
            alt={`slide-${index}`}
            role="presentation"
            className="w-full h-[300px] md:h-[450px] object-cover rounded-xl"
        />
    ));

    return (
        <div className="w-full">
            <AliceCarousel
                items={items}
                autoPlay
                autoPlayInterval={3000}
                animationDuration={800}
                infinite
                mouseTracking
                disableButtonsControls
                disableDotsControls={false}
            />

            <style>{`
        .alice-carousel__dots { 
          position: absolute; 
          bottom: 10px; 
          left: 0; 
          right: 0; 
          display: flex; 
          justify-content: center; 
          gap: 6px;
        }
        .alice-carousel__dots-item { 
          width: 7px; 
          height: 7px; 
          background: rgba(255,255,255,0.6); 
          border-radius: 50%;
          transition: transform .2s, background-color .2s;
        }
        .alice-carousel__dots-item.__active { 
          background: #10b981; 
          transform: scale(1.2);
        }
      `}</style>
        </div>
    );
}
