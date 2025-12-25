import { apiFetch } from "./client";

/**
 * Lấy thông tin profile của admin hiện tại
 */
export const getCurrentProfile = async () => {
  try {
    const data = await apiFetch("/user/profile");
    return data;
  } catch (error) {
    const errorMessage = error.message || "Cannot fetch profile information";
    throw new Error(errorMessage);
  }
};

/**
 * Cập nhật profile của admin hiện tại
 */
export const updateProfile = async (profileData) => {
  try {
    const data = await apiFetch("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    return data;
  } catch (error) {
    const errorData = error.data || {};
    const errorMessage = errorData.message || errorData.error || error.message || "Profile update failed";
    
    const apiError = new Error(errorMessage);
    if (errorData.errors) {
      apiError.errors = errorData.errors;
    }
    
    throw apiError;
  }
};

/**
 * Đổi mật khẩu tài khoản admin hiện tại
 */
export const changePassword = async (payload) => {
  try {
    const data = await apiFetch("/user/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  } catch (error) {
    const errorData = error.data || {};
    const errorMessage = errorData.error || errorData.message || error.message || "Change password failed";
    throw new Error(errorMessage);
  }
};

