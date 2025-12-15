import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useState } from "react";
import "./toast.css";

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [toast, setToast] = useState("");
    const [emailSentTo, setEmailSentTo] = useState("");
    const [countdown, setCountdown] = useState(60);

    // ---------------- VALIDATION STEP 1 (EMAIL) ----------------
    const schemaEmail = Yup.object().shape({
        email: Yup.string()
            .email("Invalid email format")
            .required("Email is required"),
    });

    const formEmail = useForm({
        resolver: yupResolver(schemaEmail),
    });

    // ---------------- VALIDATION STEP 2 (OTP + NEW PASSWORD) ----------------
    const schemaReset = Yup.object().shape({
        otp: Yup.string()
            .required("OTP is required")
            .matches(/^[0-9]{4}$/, "OTP must be exactly 4 digits"),
        newPassword: Yup.string()
            .required("New password is required")
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
                "Min 8 chars, include uppercase, lowercase, number & symbol."
            ),
    });

    const formReset = useForm({
        resolver: yupResolver(schemaReset),
    });

    // ---------------- TOAST ----------------
    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 1500);
    };

    // ---------------- SUBMIT STEP 1 ----------------
    const submitEmail = (data) => {
        console.log("Send OTP to:", data.email);
        setEmailSentTo(data.email);
        setStep(2);
        showToast("Verification code sent!");

        let time = 60;
        setCountdown(time);

        const timer = setInterval(() => {
            time--;
            setCountdown(time);
            if (time <= 0) clearInterval(timer);
        }, 1000);
    };

    // ---------------- SUBMIT STEP 2 ----------------
    const submitReset = (data) => {
        console.log("Reset:", data);
        showToast("Password reset successful!");
        setTimeout(() => (window.location.href = "/login"), 1500);
    };

    // ---------------- INPUT STYLE — màu cam đẹp ----------------
    const inputClass =
        "w-full px-4 py-2 mt-1 rounded-lg bg-neutral-100 " +
        "border border-primary-400 " +
        "focus:border-primary-600 focus:ring-2 focus:ring-primary-200 " +
        "focus:outline-none placeholder:text-neutral-500 transition";

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-12">

            {/* BG SHAPES */}
            <div className="absolute inset-0 -z-10 bg-neutral-50">
                <div className="absolute top-10 left-10 w-40 h-40 bg-primary-200/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent-200/20 rounded-full blur-2xl"></div>
            </div>

            {/* TOAST */}
            {toast && (
                <div className="fixed inset-0 z-50 flex items-center justify-center toast-backdrop">
                    <div className="toast-premium bg-white/90 backdrop-blur-xl px-10 py-8 rounded-2xl text-center shadow-2xl border border-white/40">
                        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-primary-500 shadow-lg mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" strokeWidth="2.5"
                                stroke="white" className="w-9 h-9">
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
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 relative">

                <h2 className="text-center text-2xl font-bold text-primary-700 mb-6">
                    {step === 1 ? "Forgot Password" : "Verify OTP"}
                </h2>

                {/* -------- STEP 1 -------- */}
                {step === 1 && (
                    <form onSubmit={formEmail.handleSubmit(submitEmail)} className="space-y-6">

                        <div>
                            <label className="text-sm font-medium text-neutral-700">Email Address</label>
                            <input
                                {...formEmail.register("email")}
                                type="email"
                                placeholder="Enter your email"
                                className={inputClass}
                            />
                            {formEmail.formState.errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {formEmail.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 text-white font-semibold rounded-lg bg-primary-500 hover:bg-primary-600 transition"
                        >
                            Send Verification Code
                        </button>
                    </form>
                )}

                {/* -------- STEP 2 -------- */}
                {step === 2 && (
                    <form onSubmit={formReset.handleSubmit(submitReset)} className="space-y-6">

                        <p className="text-sm text-neutral-600">
                            Code sent to: <span className="font-semibold">{emailSentTo}</span>
                        </p>

                        {/* OTP */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">OTP Code</label>
                            <input
                                {...formReset.register("otp")}
                                type="text"
                                placeholder="4-digit code"
                                className={inputClass}
                            />
                            {formReset.formState.errors.otp && (
                                <p className="text-red-500 text-sm mt-1">{formReset.formState.errors.otp.message}</p>
                            )}
                        </div>

                        {/* NEW PASS */}
                        <div>
                            <label className="text-sm font-medium text-neutral-700">New Password</label>
                            <input
                                {...formReset.register("newPassword")}
                                type="password"
                                placeholder="Enter new password"
                                className={inputClass}
                            />
                            {formReset.formState.errors.newPassword && (
                                <p className="text-red-500 text-sm mt-1">{formReset.formState.errors.newPassword.message}</p>
                            )}
                        </div>

                        {/* RESEND OTP */}
                        <div className="flex justify-between text-sm text-neutral-700">
                            <span>Didn’t receive the code?</span>
                            <button
                                type="button"
                                disabled={countdown > 0}
                                onClick={() => submitEmail({ email: emailSentTo })}
                                className={
                                    countdown > 0
                                        ? "text-gray-400 font-semibold"
                                        : "text-primary-600 hover:underline font-semibold"
                                }
                            >
                                Resend {countdown > 0 && `(${countdown}s)`}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 text-white font-semibold rounded-lg bg-primary-500 hover:bg-primary-600 transition"
                        >
                            Reset Password
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}
