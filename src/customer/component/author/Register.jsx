import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./toast.css";
import logo from "../../../assets/img/logo.png";
import { register as registerAPI } from "../../../services/common/authService";

import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const schema = Yup.object().shape({
    username: Yup.string()
        .required("Username is required")
        .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .min(3, "Username must be between 3–20 characters")
        .max(20, "Username must be between 3–20 characters"),

    email: Yup.string()
        .required("Email is required")
        .email("Invalid email format"),

    password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),

    confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords do not match"),

    acceptTerms: Yup.bool().oneOf([true], "You must accept the terms and conditions"),
});

export default function Register() {
    const navigate = useNavigate();
    const [toast, setToast] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const showSuccess = () => {
        setToast("Registration successful!");
        setTimeout(() => {
            setToast("");
            navigate("/login");
        }, 2000);
    };

    const showError = (message) => {
        setError(message);
        setTimeout(() => setError(""), 5000);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError("");

        try {
            const registerData = {
                username: data.username,
                password: data.password,
                email: data.email,
            };

            await registerAPI(registerData);
            showSuccess();
        } catch (err) {
            // Hiển thị thông báo lỗi từ backend
            let errorMessage = err.message || "Registration failed. Please try again!";
            
            // Kiểm tra và hiển thị thông báo rõ ràng cho email trùng
            if (errorMessage.toLowerCase().includes("email") && 
                (errorMessage.toLowerCase().includes("tồn tại") || 
                 errorMessage.toLowerCase().includes("already exists") ||
                 errorMessage.toLowerCase().includes("duplicate"))) {
                errorMessage = "Email đã tồn tại. Vui lòng sử dụng email khác!";
            }
            
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full pl-10 px-4 py-2 mt-1 rounded-lg bg-neutral-100 " +
        "border border-primary-400 " +
        "focus:border-primary-600 " +
        "focus:ring-2 focus:ring-primary-300 " +
        "focus:outline-none placeholder:text-neutral-500 transition";

    return (
        <div className="relative flex-1 flex items-center justify-center px-4 py-12 overflow-hidden pt-20">

            {/* SUCCESS TOAST */}
            {toast && (
                <div className="fixed inset-0 z-50 flex items-center justify-center toast-backdrop">
                    <div className="toast-premium bg-white/90 px-10 py-8 rounded-2xl shadow-2xl border border-white/40 text-center">
                        <div className="w-16 h-16 flex items-center justify-center mx-auto rounded-full bg-primary-500 shadow-lg mb-4">
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

            {/* CARD */}
            <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8">

                <div className="flex justify-center mb-6">
                    <a href="/">
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-14 w-14 rounded-full object-cover border-2 border-primary-500 shadow-md"
                        />
                    </a>
                </div>

                <h2 className="text-center text-xl font-semibold text-primary-700 mb-6">
                    Create Your Account
                </h2>

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* USERNAME */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700">Username</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input
                                {...register("username")}
                                placeholder="Enter username"
                                className={inputClass}
                            />
                        </div>
                        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700">Email</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="Enter email"
                                className={inputClass}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input
                                {...register("password")}
                                type="password"
                                placeholder="Enter password"
                                className={inputClass}
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div>
                        <label className="text-sm font-medium text-neutral-700">Confirm Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input
                                {...register("confirmPassword")}
                                type="password"
                                placeholder="Re-enter password"
                                className={inputClass}
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                    </div>

                    {/* TERMS */}
                    <div className="flex items-center gap-2 text-sm">
                        <input type="checkbox" {...register("acceptTerms")} className="w-4 h-4 accent-primary-500" />
                        <p>
                            I agree to the{" "}
                            <a href="#" className="text-primary-600 underline">Terms & Conditions</a>
                        </p>
                    </div>
                    {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>}

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 text-white font-semibold rounded-lg bg-primary-500 hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="text-center text-sm text-neutral-700 mt-6">
                    Already have an account?{" "}
                    <a href="/login" className="text-primary-600 font-semibold hover:underline">
                        Login instead
                    </a>
                </p>

            </div>
        </div>
    );
}
