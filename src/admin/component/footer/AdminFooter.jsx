export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-blue-100 text-blue-900 border-t border-blue-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            <p className="font-medium">© {currentYear} Hệ thống Quản trị. Tất cả quyền được bảo lưu.</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-blue-700 transition">Hỗ trợ</a>
            <a href="#" className="hover:text-blue-700 transition">Chính sách</a>
            <a href="#" className="hover:text-blue-700 transition">Liên hệ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

