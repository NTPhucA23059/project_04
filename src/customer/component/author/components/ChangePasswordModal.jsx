import { useState } from "react";
import "../profile.css"

export default function ChangePasswordModal({
    show,
    onClose,
    onSubmit,
    loading,
}) {
    const [errors, setErrors] = useState({});

    if (!show) return null;

    const validate = (data) => {
        const newErrors = {};

        if (!data.oldPassword?.trim()) newErrors.oldPassword = "Current password is required.";

        if (!data.newPassword?.trim()) newErrors.newPassword = "New password is required.";
        else if (data.newPassword.length < 8)
            newErrors.newPassword = "Password must be at least 8 characters.";
        
        if (!data.confirmPassword?.trim())
            newErrors.confirmPassword = "Please confirm your new password.";
        else if (data.newPassword !== data.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match.";

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = {
            oldPassword: e.target.oldPassword.value,
            newPassword: e.target.newPassword.value,
            confirmPassword: e.target.confirmPassword.value,
        };

        const validationErrors = validate(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <h3>Change Password</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form className="modal-form-grid" onSubmit={handleSubmit}>

                    {/* CURRENT PASSWORD */}
                    <div className="modal-form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            name="oldPassword"
                            className={errors.oldPassword ? "input-error" : ""}
                        />
                        {errors.oldPassword && (
                            <p className="error-text">{errors.oldPassword}</p>
                        )}
                    </div>

                    {/* NEW PASSWORD */}
                    <div className="modal-form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            className={errors.newPassword ? "input-error" : ""}
                        />
                        {errors.newPassword && (
                            <p className="error-text">{errors.newPassword}</p>
                        )}
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="modal-form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className={errors.confirmPassword ? "input-error" : ""}
                        />
                        {errors.confirmPassword && (
                            <p className="error-text">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <button className="modal-save-btn" disabled={loading}>
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}










