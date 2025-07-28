import { jwtDecode } from "jwt-decode";

// Kiểm tra xem user đã đăng nhập chưa
export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        // Kiểm tra token có hết hạn không
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch (error) {
        return false;
    }
};

// Lấy thông tin user từ token
export const getUserInfo = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return {
            user_id: decoded.user_id,
            email: decoded.email,
            name: decoded.name || "User",
            session_id: decoded.session_id,
        };
    } catch (error) {
        return null;
    }
};

// Xóa token và logout
export const logout = () => {
    localStorage.removeItem("token");
};

// Lấy token
export const getToken = () => {
    return localStorage.getItem("token");
};
