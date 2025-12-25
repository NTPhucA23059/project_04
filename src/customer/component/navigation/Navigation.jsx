import { Fragment, useState, useEffect } from 'react'
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    Popover,
    PopoverButton,
    PopoverPanel,
} from '@headlessui/react'
import {
    Bars3Icon, MagnifyingGlassIcon, UserCircleIcon, XMarkIcon, ClipboardDocumentListIcon, HomeIcon,
    GlobeAmericasIcon,
    TruckIcon,
    BuildingOfficeIcon,
    PaperAirplaneIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline'
import { Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { getCurrentUser, isAuthenticated, logout } from '../../../services/common/authService';
import logo from '../../../assets/img/logo.png';





const navigation = {
    pages: [
        { name: "Home", href: "/", icon: HomeIcon },
        { name: "Tour", href: "/tours", icon: GlobeAmericasIcon },
        { name: "Car Rental", href: "/cars", icon: TruckIcon },
        { name: "Hotel", href: "/hotels", icon: BuildingOfficeIcon },
        { name: "Flights", href: "/flights", icon: PaperAirplaneIcon },
        { name: "Contact", href: "/contact", icon: InformationCircleIcon },
    ],
};



const LANGUAGES = {
    vi: {
        code: "VI",
        flag: "https://flagcdn.com/w20/vn.png",
    },
    en: {
        code: "EN",
        flag: "https://flagcdn.com/w20/gb.png",
    },
}

export default function Navigation() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false)
    const [language, setLanguage] = useState("vi")
    const [user, setUser] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const checkAuth = () => {
            const currentUser = getCurrentUser();
            setUser(currentUser);
            setIsLoggedIn(isAuthenticated());
        };

        checkAuth();

        // Listen for storage changes (khi logout từ component khác hoặc login)
        const handleStorageChange = (e) => {
            if (e.key === 'token' || e.key === 'user') {
                checkAuth();
            }
        };

        // Listen for custom event khi login thành công
        const handleLoginSuccess = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLogin', handleLoginSuccess);

        // Check lại mỗi khi component được focus (khi navigate về)
        const handleFocus = () => {
            checkAuth();
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLogin', handleLoginSuccess);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setUser(null);
        setIsLoggedIn(false);
        navigate('/');
    }

    return (
        <div className="w-full bg-white">
            {/* Mobile menu */}
            <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
                <DialogBackdrop className="fixed inset-0 bg-black/25" />

                <div className="fixed inset-0 z-40 flex">
                    <DialogPanel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl">

                        {/* Close */}
                        <div className="flex justify-end px-4 pb-2 pt-5">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="inline-flex rounded-md p-2 text-gray-400"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Mobile Pages */}
                        <div className="border-t border-gray-200 px-4 py-6 space-y-4">
                            {navigation.pages.map((page) => (
                                <a key={page.name} href={page.href} className="group flex items-center text-lg font-semibold text-gray-700 hover:text-primary-600">
                                    <page.icon className="w-6 h-6 mr-2 " />
                                    {page.name}
                                </a>
                            ))}

                        </div>

                        {/* Search */}
                        <div className="border-t border-gray-200 px-4 py-6">
                            <a
                                href="/search"
                                className="flex items-center text-gray-700 hover:text-primary-600 text-base"
                            >
                                <MagnifyingGlassIcon className="w-6 h-6 mr-2" />
                                Search
                            </a>
                        </div>

                        {/* Language Selector */}
                        <div className="border-t border-gray-200 px-4 py-6 space-y-4">
                            <p className="text-sm font-semibold text-gray-700">Language</p>

                            <button
                                onClick={() => setLanguage("vi")}
                                className="flex items-center w-full px-3 py-2 rounded-md hover:bg-neutral-100"
                            >
                                <img src={LANGUAGES.vi.flag} className="w-6 h-4 rounded-sm" />
                                <span className="ml-2">VI</span>
                            </button>

                            <button
                                onClick={() => setLanguage("en")}
                                className="flex items-center w-full px-3 py-2 rounded-md hover:bg-neutral-100"
                            >
                                <img src={LANGUAGES.en.flag} className="w-6 h-4 rounded-sm" />
                                <span className="ml-2">EN</span>
                            </button>
                        </div>

                        {/* Profile */}
                        <div className="border-t border-gray-200 px-4 py-6 space-y-4">
                            <p className="text-sm font-semibold text-gray-700">Account</p>

                            <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-neutral-100">
                                <UserCircleIcon className="w-6 h-6 mr-2" />
                                My Profile
                            </a>

                            <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-neutral-100">
                                <ClipboardDocumentListIcon className="w-6 h-6 mr-2" />
                                Bookings
                            </a>

                            <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-neutral-100">
                                Service History
                            </a>

                            <a href="#" className="flex items-center px-3 py-2 rounded-md hover:bg-neutral-100">
                                Settings
                            </a>

                            <a href="#" className="flex items-center px-3 py-2 rounded-md text-red-600 hover:bg-neutral-100">
                                Logout
                            </a>
                        </div>

                        {/* Auth */}
                        {isLoggedIn && user ? (
                            <div className="border-t border-gray-200 px-4 py-6 space-y-4">
                                <p className="text-base font-medium text-primary-600">
                                    Hello, {user.username}
                                </p>
                            </div>
                        ) : (
                            <div className="border-t border-gray-200 px-4 py-6 space-y-4">
                                <a href="/login" className="block text-base font-medium text-gray-900 hover:text-primary-600">
                                    Sign in
                                </a>
                                <a href="/register" className="block text-base font-medium text-gray-900 hover:text-primary-600">
                                    Create account
                                </a>
                            </div>
                        )}
                    </DialogPanel>
                </div>
            </Dialog>



            {/* Desktop */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
                <nav className="w-full px-4 sm:px-6 lg:px-8" aria-label="Top">
                    <div className="border-b border-gray-200">
                        <div className="flex h-16 items-center">
                            {/* Mobile button */}
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                className="rounded-md bg-white p-2 text-gray-400 lg:hidden"
                            >
                                <Bars3Icon className="size-6" />
                            </button>

                            {/* Logo */}
                            <div className="ml-4 flex lg:ml-0">
                                <a href="/">
                                    <img
                                        src={logo}
                                        alt="Logo"
                                        className="h-20 w-20"
                                    />
                                </a>
                            </div>



                            {/* Desktop Navigation */}
                            <div className="hidden lg:block lg:ml-8">
                                <div className="flex items-center space-x-8">
                                    {navigation.pages.map((page) => (
                                        <a key={page.name} href={page.href} className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600">
                                            <page.icon className="w-5 h-5 mr-1" />
                                            {page.name}
                                        </a>
                                    ))}

                                </div>
                            </div>

                            {/* Right section */}
                            <div className="ml-auto flex items-center">


                                {/* Auth */}
                                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                                    {/* Search */}
                                    <a href="/search" className="p-2 text-gray-400 hover:text-primary-500">
                                        <MagnifyingGlassIcon className="size-6" />
                                    </a>
                                    <span className="h-6 w-px bg-gray-200" />

                                    {/* Hello + Username khi đã đăng nhập */}
                                    {isLoggedIn && user ? (
                                        <>
                                            <span className="text-sm font-medium text-primary-600">
                                                Hello, {user.username}
                                            </span>
                                            <span className="h-6 w-px bg-gray-200" />
                                        </>
                                    ) : (
                                        <>
                                            <a href="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                                                Sign in
                                            </a>
                                            <span className="h-6 w-px bg-gray-200" />
                                            <a href="/register" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                                                Create account
                                            </a>
                                            <span className="h-6 w-px bg-gray-200" />
                                        </>
                                    )}
                                    {/* Language */}
                                    <Popover className="hidden lg:ml-8 lg:flex">
                                        <PopoverButton className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 focus:outline-none">
                                            <img
                                                src={LANGUAGES[language].flag}
                                                className="h-4 w-6 rounded-sm object-cover"
                                            />
                                            <span className="ml-2">{LANGUAGES[language].code}</span>

                                            <svg
                                                className="ml-1 h-4 w-4 text-gray-500"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </PopoverButton>

                                        <PopoverPanel
                                            anchor="bottom start"
                                            className="absolute mt-2 w-36 rounded-md bg-white border border-neutral-200 shadow-xl p-2 z-50"
                                        >
                                            {({ close }) => (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setLanguage("vi")
                                                            close()
                                                        }}
                                                        className="flex items-center w-full px-3 py-2 rounded-md hover:bg-neutral-100 transition"
                                                    >
                                                        <img src={LANGUAGES.vi.flag} className="h-4 w-6 rounded-sm" />
                                                        <span className="ml-2 text-sm font-medium">VI</span>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setLanguage("en")
                                                            close()
                                                        }}
                                                        className="flex items-center w-full px-3 py-2 rounded-md hover:bg-neutral-100 transition"
                                                    >
                                                        <img src={LANGUAGES.en.flag} className="h-4 w-6 rounded-sm" />
                                                        <span className="ml-2 text-sm font-medium">EN</span>
                                                    </button>
                                                </>
                                            )}
                                        </PopoverPanel>


                                    </Popover>
                                    {/* Profile - chỉ hiển thị khi đã đăng nhập */}
                                    {isLoggedIn && user && (
                                        <Popover className="hidden lg:ml-4 lg:flex relative">
                                            <PopoverButton className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 focus:outline-none">
                                                <UserCircleIcon className="w-6 h-6 text-gray-600" />
                                                <span className="ml-1">Profile</span>

                                                <svg
                                                    className="ml-1 h-4 w-4 text-gray-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </PopoverButton>

                                            <PopoverPanel
                                                anchor="bottom end"
                                                className="absolute mt-2 w-48 rounded-md bg-white border border-neutral-200 shadow-xl p-2 z-50"
                                            >
                                                {({ close }) => (
                                                    <div className="flex flex-col">
                                                        <button
                                                            onClick={() => {
                                                                close();
                                                                navigate("/profile");
                                                            }}
                                                            className="flex items-center w-full px-3 py-2 rounded-md hover:bg-neutral-100 transition text-left"
                                                        >
                                                            My Profile
                                                        </button>



                                                        <button
                                                            onClick={() => { close(); navigate("/my-tour-bookings"); }}
                                                            className="flex items-center w-full px-3 py-2 rounded-md hover:bg-neutral-100 transition text-left"
                                                        >
                                                            My tours Bookings
                                                        </button>
                                                        <button
                                                            onClick={() => { close(); navigate("/my-car-bookings"); }}
                                                            className="flex items-center w-full px-3 py-2 rounded-md hover:bg-neutral-100 transition text-left"
                                                        >
                                                            My Car Bookings
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                close();
                                                                handleLogout();
                                                            }}
                                                            className="flex items-center w-full px-3 py-2 rounded-md hover:bg-neutral-100 text-red-600 transition text-left"
                                                        >
                                                            Logout
                                                        </button>
                                                    </div>
                                                )}
                                            </PopoverPanel>
                                        </Popover>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        </div>
    )
}
