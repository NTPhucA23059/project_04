import api from "../api";

/**
 * Lấy thông tin profile của staff hiện tại
 */
export const getCurrentProfile = async () => {
  try {
    const response = await api.get("/profile");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Cannot fetch profile information";
    throw new Error(errorMessage);
  }
};

/**
 * Cập nhật profile của staff hiện tại
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/profile", profileData);
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    let errorMessage = "Profile update failed";
    
    if (errorData) {
      errorMessage = errorData.message || errorData.error || errorMessage;
    }
    
    const apiError = new Error(errorMessage);
    if (errorData?.errors) {
      apiError.errors = errorData.errors;
    }
    
    throw apiError;
  }
};

/**
 * Đổi mật khẩu tài khoản hiện tại
 */
export const changePassword = async (payload) => {
  try {
    const response = await api.post("/profile/change-password", payload);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || "Change password failed";
    throw new Error(errorMessage);
  }
};



