import api from "../api";

/**
 * Lấy thông tin profile của user hiện tại
 */
export const getCurrentProfile = async () => {
  try {
    const response = await api.get("/user/profile");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Cannot fetch profile information";
    throw new Error(errorMessage);
  }
};

/**
 * Cập nhật profile của user hiện tại
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/user/profile", profileData);
    return response.data;
  } catch (error) {
    // Lấy error message từ response
    const errorData = error.response?.data;
    let errorMessage = "Profile update failed";
    
    if (errorData) {
      // Ưu tiên lấy từ message, sau đó error, cuối cùng là default
      errorMessage = errorData.message || errorData.error || errorMessage;
    }
    
    // Tạo error object với message và có thể có thêm field errors
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
    const response = await api.post("/user/change-password", payload);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || "Change password failed";
    throw new Error(errorMessage);
  }
};







