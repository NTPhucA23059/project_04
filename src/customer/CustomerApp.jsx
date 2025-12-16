import { Routes, Route } from 'react-router-dom'
import Footer from './component/footer/Footer'
import HomePage from './pages/HomePage'
import GlobalToast from './component/Toast/GlobalToast'
import Navigation from './component/navigation/Navigation'
import SearchPage from './component/navigation/SearchPage'
import Register from './component/author/Register'
import Login from './component/author/Login'
import ForgotPassword from './component/author/ForgotPassword'
import Profile from './component/author/Profile'
import ContactPage from './component/contactPage/ContactPage'
import TourDetailWrapper from "./component/tourDetail/TourDetailWrapper";
import CarDetailWrapper from './component/carDetail/CarDetailWrapper'

import Tours from './component/tour/Tours'
import CarList from './component/car/CarList'
import CheckoutPage from './component/checkout/CheckoutPage'
import BookingSuccessPage from './component/checkout/BookingSuccessPage'
import MyBookingsPage from './component/bookings/MyBookingsPage'
import BookingDetailPage from './component/bookings/BookingDetailPage'
import RefundSuccessPage from './component/bookings/RefundSuccessPage'
import PayNowPage from './component/tour/PayNowPage'
import CheckoutCar from './component/car/CheckoutCar'
import CarBookingSuccess from './component/car/CarBookingSuccess'
import MyCarBookingsPage from './component/car/MyCarBookingsPage'
import CarBookingDetailPage from './component/car/CarBookingDetailPage'
import HotelsListPage from './component/hotels/HotelsListPage'
import HotelDetailPage from './component/hotels/HotelDetailPage'
import FlightsPage from './component/flight/FlightPage'
import FlightDetail from './component/flight/FlightDetail'

export default function CustomerApp() {
  return (
    <div className="min-h-screen w-full">
      <Routes>

        {/* ----------- LAYOUT CÓ NAVIGATION + FOOTER ----------- */}
        <Route
          path="/"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <HomePage />
              <Footer />
            </div>
          }
        />

        {/* ========== CÁC TRANG DÙNG LAYOUT CHUNG ========== */}
        <Route
          path="/profile"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <Profile />
              <Footer />
            </div>
          }
        />
        <Route
          path="/contact"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <ContactPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/tours/:id"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <TourDetailWrapper />
              <Footer />
            </div>
          }
        />
        <Route
          path="/car/:id"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <CarDetailWrapper />
              <Footer />
            </div>
          }
        />
        <Route
          path="/tours"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <Tours />
              <Footer />
            </div>
          }
        />
        <Route
          path="/cars"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <CarList />
              <Footer />
            </div>
          }
        />
        <Route
          path="/hotels"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <HotelsListPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/hotels/:id"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <HotelDetailPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/flights"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <FlightsPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/flights/:id"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <FlightDetail />
              <Footer />
            </div>
          }
        />
        <Route path="/checkout/:detailID" element={
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <CheckoutPage />
            <Footer />
          </div>
        } />
        <Route
          path="/booking-success"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <BookingSuccessPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/my-tour-bookings"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <MyBookingsPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/booking-detail"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <BookingDetailPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/refund-success"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <RefundSuccessPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/payment"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <PayNowPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/checkoutCar/:id" element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <CheckoutCar />
              <Footer />
            </div>
          }
        />
        <Route
          path="/car-booking-success" element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <CarBookingSuccess />
              <Footer />
            </div>
          }
        />
        <Route
          path="/my-car-bookings"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <MyCarBookingsPage />
              <Footer />
            </div>
          }
        />
        <Route
          path="/car-booking-detail"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <CarBookingDetailPage />
              <Footer />
            </div>
          }
        />

        {/* ----------- TRANG KHÔNG DÙNG LAYOUT (CHỈ SEARCH) ----------- */}
        <Route path="/search" element={<SearchPage />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />



        {/* ----------- 404 PAGE ----------- */}
        <Route
          path="*"
          element={
            <div className="p-10 text-center text-gray-600">
              <h2 className="text-2xl font-semibold mb-3">404 - Không tìm thấy trang</h2>
              <a href="/" className="text-green-600 hover:underline font-medium">
                ⬅ Quay lại Trang chủ
              </a>
            </div>
          }
        />

      </Routes>

      <GlobalToast />
    </div>
  );
}
