import { Routes, Route } from 'react-router-dom'
import Footer from './component/footer/Footer'
import HomePage from './pages/HomePage'
import GlobalToast from './component/Toast/GlobalToast'
import Navigation from './component/navigation/Navigation'




export default function CustomerApp() {

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <main >
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="*"
            element={
              <div className="p-10 text-center text-gray-600">
                <h2 className="text-2xl font-semibold mb-3">404 - Không tìm thấy trang</h2>
                <a href="/" className="text-green-600 hover:underline font-medium">⬅ Quay lại Trang chủ</a>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
      <GlobalToast />
    </div>
  )
}




