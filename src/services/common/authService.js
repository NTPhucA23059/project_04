import api from "../api";

/**
 * Đăng nhập
 */
export const login = async (username, password) => {
  try {
    const response = await api.post("/auth/login", {
      username,
      password,
    });

    const { token, user } = response.data;

    if (token) {
      localStorage.setItem("token", token);
    }
    
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      // Dispatch custom event để Navigation component cập nhật
      window.dispatchEvent(new Event('userLogin'));
    }

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!";
    throw new Error(errorMessage);
  }
};

/**
 * Đăng ký
 */
export const register = async (registerData) => {
  try {
    const response = await api.post("/auth/register", registerData);

    const { token, user } = response.data;

    // Lưu token và user vào localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  } catch (error) {
    // Xử lý lỗi và throw để component có thể bắt
    const errorMessage = error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
    throw new Error(errorMessage);
  }
};

/**
 * Đăng xuất
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Lấy thông tin user hiện tại từ localStorage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }
  return null;
};

/**
 * Kiểm tra xem user đã đăng nhập chưa
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};





