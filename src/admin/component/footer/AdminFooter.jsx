export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-blue-100 text-blue-900 border-t border-blue-200 shadow-sm relative z-10">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs sm:text-sm text-center md:text-left">
            <p className="font-medium">© {currentYear} Admin System. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <a href="#" className="hover:text-blue-700 transition-colors">Support</a>
            <a href="#" className="hover:text-blue-700 transition-colors">Policy</a>
            <a href="#" className="hover:text-blue-700 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

