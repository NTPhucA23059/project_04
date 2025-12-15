import api from "../api";

/**
 * Lấy token từ localStorage
 */
export function getToken() {
  return localStorage.getItem("token");
}

/**
 * Lưu token vào localStorage
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

/**
 * Xóa token khỏi localStorage
 */
export function removeToken() {
  localStorage.removeItem("token");
}

/**
 * Xử lý lỗi authentication và redirect về login
 */
function handleAuthError(status) {
  if (status === 401 || status === 403) {
    removeToken();
    // Chỉ redirect nếu không phải đang ở trang login
    if (!window.location.pathname.includes("/admin/login")) {
      window.location.href = "/admin/login";
    }
  }
}

/**
 * API Fetch function sử dụng axios với error handling và authentication
 * Tương thích với code cũ sử dụng fetch
 */
export async function apiFetch(path, options = {}) {
  try {
    // Chuyển đổi options từ fetch sang axios
    const axiosConfig = {
      method: options.method || "GET",
      url: path,
    };

    // Xử lý body/data
    if (options.body) {
      if (options.body instanceof FormData) {
        axiosConfig.data = options.body;
        // Axios tự động set Content-Type cho FormData
      } else if (typeof options.body === "string") {
        // Nếu là string, parse JSON
        try {
          axiosConfig.data = JSON.parse(options.body);
        } catch (e) {
          axiosConfig.data = options.body;
        }
      } else {
        axiosConfig.data = options.body;
      }
    }

    // Xử lý headers
    if (options.headers) {
      axiosConfig.headers = { ...options.headers };
    }

    // Gọi API bằng axios
    const response = await api(axiosConfig);

    // Trả về data từ response (axios tự động parse JSON)
    return response.data;
  } catch (error) {
    // Xử lý lỗi từ axios
    if (error.response) {
      // Server trả về response với status code lỗi
      const status = error.response.status;
      const data = error.response.data;

      // Xử lý authentication errors
      handleAuthError(status);

      // Create error object similar to fetch
      const errorMessage = data?.message || data?.error || error.message || "Request failed";
      const apiError = new Error(errorMessage);
      apiError.status = status;
      apiError.data = data;
      throw apiError;
    } else if (error.request) {
      // Request was sent but no response received
      const networkError = new Error(
        "Unable to connect to server. Please check your network connection."
      );
      networkError.status = 0;
      throw networkError;
    } else {
      // Lỗi khi setup request
      throw error;
    }
  }
}

/**
 * Helper function để tạo query string từ object
 */
export function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
}
