import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./toast.css";
import logo from "../../../assets/img/logo.png";
import { login } from "../../../services/common/authService";

import { FaUser, FaLock } from "react-icons/fa";

export default function Login() {
    const navigate = useNavigate();
    const [toast, setToast] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // VALIDATION
    const schema = Yup.object().shape({
        username: Yup.string().required("Username is required"),
        password: Yup.string()
            .required("Password is required")
            .min(6, "Password must be at least 6 characters"),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const showSuccess = (roleName) => {
        setToast("Login Successful!");

        setTimeout(() => {
            setToast("");
            const normalizedRole = (roleName || "").toString().toUpperCase().trim();
            if (normalizedRole === "ADMIN") {
                console.log("Redirecting to /admin");
                window.location.href = "/admin";
            } else if (normalizedRole === "STAFF") {
                console.log("Redirecting to /staff");
                window.location.href = "/staff";
            } else {
                console.log("Redirecting to / (customer)");
                navigate("/", { replace: true });
            }
        }, 1500); 
    };

    const showError = (message) => {
        setError(message);
        setTimeout(() => {
            setError("");
        }, 5000);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError("");

        try {
            const response = await login(data.username, data.password);

            // Debug: Log toàn bộ response
            console.log("=== LOGIN DEBUG ===");
            console.log("Full response:", response);
            console.log("Response.user:", response?.user);
            console.log("Response.user.roleName:", response?.user?.roleName);
            console.log("Response.user.role:", response?.user?.role);
            console.log("Response.user.role?.roleName:", response?.user?.role?.roleName);

            // Lấy roleName từ nhiều nguồn có thể
            let roleName = "";
            if (response?.user?.roleName) {
                roleName = response.user.roleName;
            } else if (response?.user?.role?.roleName) {
                roleName = response.user.role.roleName;
            } else {
                // Fallback: lấy từ localStorage nếu có
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        roleName = user?.roleName || user?.role?.roleName || "";
                    } catch (e) {
                        console.error("Error parsing user from localStorage:", e);
                    }
                }
            }

            console.log("Final roleName:", roleName);
            console.log("Normalized roleName:", roleName?.toUpperCase());
            console.log("==================");

            if (!roleName) {
                console.warn("No roleName found, defaulting to USER");
                roleName = "USER";
            }

            showSuccess(roleName);
        } catch (err) {
            showError(err.message || "Đăng nhập thất bại. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full pl-10 px-4 py-2 mt-1 rounded-lg bg-neutral-100 " +
        "border border-primary-400 " +
        "focus:border-primary-600 focus:ring-2 focus:ring-primary-300 " +
        "focus:outline-none placeholder:text-neutral-500 transition";

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">

            {/* TOAST */}
            {toast && (
                <div className="fixed inset-0 z-50 flex items-center justify-center toast-backdrop">
                    <div className="toast-premium bg-white/90 px-10 py-8 rounded-2xl shadow-2xl text-center border border-white/40">
                        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-primary-500 shadow-lg mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" strokeWidth="2.5" stroke="white"
                                className="w-9 h-9">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-700">Success!</h3>
                        <p className="text-neutral-600 mt-1 text-sm">{toast}</p>
                    </div>
                </div>
            )}

            {/* LOGIN CARD */}
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">

                <div className="flex justify-center mb-6">
                    <a href="/"><img
                        src={logo}
                        alt="Logo"
                        className="h-14 w-14 rounded-full object-cover border-2 border-primary-500 shadow-md"
                    /></a>
                </div>
                <h2 className="text-center text-xl font-semibold text-primary-700 mb-6">
                    Login to Your Account
                </h2>

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* USERNAME */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700">Username</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />

                            <input
                                {...register("username")}
                                placeholder="Enter your username"
                                className={inputClass}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                        )}
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />

                            <input
                                {...register("password")}
                                type="password"
                                placeholder="Enter your password"
                                className={inputClass}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    {/* REMEMBER + FORGOT */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-neutral-700">
                            <input type="checkbox" className="w-4 h-4 accent-primary-500" />
                            Remember me
                        </label>

                        <a href="/forgot-password" className="text-primary-600 hover:underline">
                            Forgot password?
                        </a>
                    </div>

                    {/* LOGIN BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 text-white font-semibold rounded-lg bg-primary-500 hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang đăng nhập..." : "Login"}
                    </button>
                </form>

                {/* REGISTER LINK */}
                <p className="text-center text-sm text-neutral-700 mt-6">
                    Don't have an account?{" "}
                    <a href="/register" className="text-primary-600 font-semibold hover:underline">
                        Register now
                    </a>
                </p>

            </div>
        </div>
    );
}
