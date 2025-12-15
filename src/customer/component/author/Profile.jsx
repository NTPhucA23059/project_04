import "./profile.css";
import { useState, useEffect } from "react";
import { getCurrentUser } from "../../../services/common/authService";
import { changePassword, getCurrentProfile, updateProfile } from "../../../services/customer/profileService";
import ToastMessage from "./components/ToastMessage";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileInfo from "./components/ProfileInfo";
import EditProfileModal from "./components/EditProfileModal";
import ChangePasswordModal from "./components/ChangePasswordModal";


export default function Profile() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [pwError, setPwError] = useState("");
    const [editErrors, setEditErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [changePwLoading, setChangePwLoading] = useState(false);
    // Toast state
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success", // success | error
    });

    // Show toast function
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type });
        }, 3000);
    };

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);

            try {
                const profileData = await getCurrentProfile();
                setUser(profileData);
                localStorage.setItem("user", JSON.stringify(profileData));
            } catch (error) {
                const localUser = getCurrentUser();
                console.log(error)
                if (localUser) setUser(localUser);
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    // Password validation rules
    const validatePassword = (newPass, confirmPass, oldPass) => {
        if (newPass !== confirmPass) return "Passwords do not match.";
        if (newPass === oldPass) return "New password must be different from the old password.";
        if (newPass.length < 8) return "Password must be at least 8 characters long.";
        if (!/[a-z]/.test(newPass)) return "Password must contain at least one lowercase letter.";
        if (!/[A-Z]/.test(newPass)) return "Password must contain at least one uppercase letter.";
        if (!/[0-9]/.test(newPass)) return "Password must contain at least one number.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPass))
            return "Password must contain at least one special character.";

        return "";
    };

    // Profile validation
    const validateProfile = (data) => {
        let errors = {};

        if (data.fullName && !data.fullName.trim())
            errors.fullName = "Full name is required.";

        if (!data.email || !data.email.trim())
            errors.email = "Email is required.";
        else if (!/^\S+@\S+\.\S+$/.test(data.email))
            errors.email = "Invalid email format.";

        if (data.phone && !/^[0-9]{9,11}$/.test(data.phone))
            errors.phone = "Phone number must be 9-11 digits.";

        if (data.gender && !["MALE", "FEMALE", "OTHER"].includes(data.gender))
            errors.gender = "Gender must be MALE, FEMALE, or OTHER.";

        if (data.citizenCard && !/^[0-9]{9,12}$/.test(data.citizenCard))
            errors.citizenCard = "Citizen ID must be 9–12 digits.";

        return errors;
    };

    // Update profile handler
    const handleUpdateProfile = async (formData) => {
        try {
            setUpdateLoading(true);
            setEditErrors({});

            const errors = validateProfile(formData);
            if (Object.keys(errors).length > 0) {
                setEditErrors(errors);
                return;
            }

            // Validate email (required)
            if (!formData.email || !formData.email.trim()) {
                setEditErrors({ email: "Email is required" });
                return;
            }

            const updateData = {
                fullName: formData.fullName?.trim() || null,
                email: formData.email.trim(), // Email is required, không được null
                phone: formData.phone?.trim() || null,
                nationality: formData.nationality?.trim() || null,
                gender: formData.gender?.trim() || null,
                citizenCard: formData.citizenCard?.trim() || null,
            };

            const response = await updateProfile(updateData);

            setUser(response.user);
            localStorage.setItem("user", JSON.stringify(response.user));

            showToast("Profile updated successfully!", "success");
            setShowEditModal(false);
        } catch (error) {
            // Xử lý lỗi từ backend
            let errorMessage = error.message || "Failed to update profile";
            
            // Nếu có field errors (validation errors), hiển thị trong form
            if (error.errors && typeof error.errors === 'object') {
                setEditErrors(error.errors);
                errorMessage = "Vui lòng kiểm tra các lỗi trong form";
            } else {
                // Nếu là lỗi duplicate hoặc lỗi khác, hiển thị toast và set error cho field tương ứng
                const lowerMessage = errorMessage.toLowerCase();
                if (lowerMessage.includes("email") && lowerMessage.includes("tồn tại")) {
                    setEditErrors({ email: "Email đã tồn tại" });
                    errorMessage = "Email đã được sử dụng bởi tài khoản khác";
                } else if (lowerMessage.includes("số điện thoại") && lowerMessage.includes("tồn tại")) {
                    setEditErrors({ phone: "Số điện thoại đã tồn tại" });
                    errorMessage = "Số điện thoại đã được sử dụng bởi tài khoản khác";
                } else if (lowerMessage.includes("email") && lowerMessage.includes("bắt buộc")) {
                    setEditErrors({ email: "Email là bắt buộc" });
                    errorMessage = "Vui lòng nhập email";
                }
            }
            
            showToast(errorMessage, "error");
        } finally {
            setUpdateLoading(false);
        }
    };

    // Change password handler
    const handleChangePassword = async (e) => {
        e.preventDefault();
        const oldPassword = e.target.oldPassword.value;
        const newPassword = e.target.newPassword.value;
        const confirmPassword = e.target.confirmPassword.value;

        const error = validatePassword(newPassword, confirmPassword, oldPassword);
        if (error) {
            setPwError(error);
            return;
        }

        setPwError("");
        setChangePwLoading(true);
        try {
            await changePassword({ oldPassword, newPassword });
            showToast("Password updated successfully!");
            setShowChangePassword(false);
            e.target.reset();
        } catch (err) {
            setPwError(err.message || "Failed to update password");
        } finally {
            setChangePwLoading(false);
        }
    };

    if (loading) {
        return <div className="profile-container"><p>Loading profile...</p></div>;
    }

    if (!user) {
        return <div className="profile-container"><p>Please login to view your profile.</p></div>;
    }

    return (
        <div className="profile-container">

            <ToastMessage toast={toast} onClose={() => setToast({ ...toast, show: false })} />

            {/* BREADCRUMB */}
            <div className="profile-breadcrumb">Home / Account / <span>Profile</span></div>

            <div className="profile-layout">

                <ProfileSidebar
                    user={user}
                    onChangePassword={() => {
                        setPwError("");
                        setChangePwLoading(false);
                        setShowChangePassword(true);
                    }}
                />

                <main className="profile-main">
                    <ProfileInfo user={user} onEdit={() => setShowEditModal(true)} />
                </main>
            </div>

            {/* ==========================
                EDIT PROFILE MODAL
            ============================ */}
            <EditProfileModal
                show={showEditModal}
                user={user}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleUpdateProfile}
                editErrors={editErrors}
                updateLoading={updateLoading}
            />

            <ChangePasswordModal
                show={showChangePassword}
                onClose={() => {
                    setPwError("");
                    setChangePwLoading(false);
                    setShowChangePassword(false);
                }}
                onSubmit={handleChangePassword}
                pwError={pwError}
                loading={changePwLoading}
            />

        </div>
    );
}
