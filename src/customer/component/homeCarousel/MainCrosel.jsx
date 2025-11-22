import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { mainCroselData } from './MainCroselData';

const MainCrosel = () => {
    const items = mainCroselData.map((item, index) => (
        <img
            key={index}
            src={item.image}
            alt={`slide-${index}`}
            role="presentation"
            className="w-full h-[180px] sm:h-[280px] md:h-[360px] lg:h-[420px] object-cover"
        />
    ));

    return (
        <div className="w-full mt-2">
            <div className="mx-auto max-w-7xl px-4">
                <div className="relative overflow-hidden rounded-lg">
                    <AliceCarousel
                        items={items}
                        autoPlay
                        autoPlayStrategy="default"
                        autoPlayInterval={3000}
                        animationDuration={700}
                        infinite
                        mouseTracking
                        disableButtonsControls
                        disableDotsControls={false}
                    />

                    <style>{`
                      .alice-carousel__dots { position: absolute; bottom: 8px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; margin-top: 0 !important; }
                      .alice-carousel__dots-item { width: 6px; height: 6px; background: rgba(255,255,255,0.75); border-radius: 9999px; transition: transform .2s, background-color .2s; }
                      .alice-carousel__dots-item.__active { background: #10b981; transform: scale(1.2); }
                    `}</style>
                </div>
            </div>
        </div>

    );
};

export default MainCrosel;
