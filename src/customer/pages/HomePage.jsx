import React from "react";

import HeroSection from "../component/heroSection/HeroSection";
import HeroTabs from "../component/heroSection/HeroTabs";
import StatsSection from "../component/statsSection/StatsSection";
import Testimonials from "../component/tourPage/Testimonials";

const HomePage = () => {
    return (
        <div className="w-full">
            <HeroSection />
            <hr className="my-10 h-[2px] bg-gradient-to-r from-primary-500 to-accent-400 border-0 rounded-full mt-[-30px]" />
            <StatsSection />
            <HeroTabs />
            <Testimonials />
        </div>
    );
};

export default HomePage;
