import { useState } from "react";
import StaffLayout from "../component/StaffLayout";
import Dashboard from "../component/dashboard/Dashboard";
import TourCategories from "../component/tourCategories/TourCategories";
import Seasons from "../component/seasons/Seasons";
import Cities from "../component/cities/Cities";
import Attractions from "../component/attractions/Attractions";
import TourSchedulesPage from "../component/tourSchedules/TourSchedulesPage";
import CarTypesPage from "../component/carTypes/CarTypesPage";
import CarManagement from "../component/car/CarManagement";
import TourManagement from "../component/tour/TourManagement";
import BookingManagement from "../component/booking/BookingManagement";
import RefundManagement from "../component/refund/RefundManagement";
import InvoiceManagement from "../component/invoice/InvoiceManagement";
import StaffProfile from "../component/profile/StaffProfile";
import HotelManagement from "../component/hotels/HotelManagement";
import HotelAmenityManagement from "../component/hotels/HotelAmenityManagement";
import NearbyAttractionManagement from "../component/hotels/NearbyAttractionManagement";
import FlightManagement from "../component/flight/FlightManagement";
import PackageSalesAnalysis from "../component/salesAnalysis/PackageSalesAnalysis";
import CarRentalSalesAnalysis from "../component/salesAnalysis/CarRentalSalesAnalysis";
import StaffCarBookingManagement from "../component/car/StaffCarBookingManagement";



export default function StaffPage() {
    const [activeTab, setActiveTab] = useState("dashboard");

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <Dashboard />;
            case "categoriesTour":
                return <TourCategories />;
            case "seasons":
                return <Seasons />;
            case "cities":
                return <Cities />;
            case "attractions":
                return <Attractions />;
            case "tourSchedules":
                return <TourSchedulesPage />;
            case "carTypes":
                return <CarTypesPage />;
            case "cars":
                return <CarManagement />;
            case "flights":
                return <FlightManagement />;
            case "tours":
                return <TourManagement />;
            case "bookings":
                return <BookingManagement />;
            case "refunds":
                return <RefundManagement />;
            case "invoices":
                return <InvoiceManagement />;
            case "hotels":
                return <HotelManagement />;
            case "hotelAmenities":
                return <HotelAmenityManagement />;
            case "nearbyAttractions":
                return <NearbyAttractionManagement />;
            case "profile":
                return <StaffProfile />;
            case "salesTours":
                return <PackageSalesAnalysis />;
            case "salesCars":
                return <CarRentalSalesAnalysis />;
            case "carBookings":
                return <StaffCarBookingManagement  />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <StaffLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </StaffLayout>
    );
}

