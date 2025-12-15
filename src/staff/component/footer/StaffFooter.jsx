import { 
  EnvelopeIcon, 
  PhoneIcon, 
  QuestionMarkCircleIcon 
} from "@heroicons/react/24/outline";

export default function StaffFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-neutral-900 text-white border-t border-neutral-800">
      <div className="px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Left Section */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-sm font-semibold">Staff Portal</span>
              </div>
              <p className="text-sm text-neutral-400">
                © {currentYear} All rights reserved.
              </p>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-primary-400 transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Support</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-primary-400 transition-colors"
              >
                <QuestionMarkCircleIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Help</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-primary-400 transition-colors"
              >
                <PhoneIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Contact</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
