//  services/trafficService.js
import axiosClient from "./axiosClient";

const trafficService = {
    // Lấy thống kê tổng quan traffic
    getTrafficOverview: () => {
        return axiosClient.get("/admin/users/traffic/overview");
    },

    // Lấy thống kê user mới theo tháng
    getNewUsersByMonth: (months = 6) => {
        return axiosClient.get(
            `/admin/users/traffic/new-users-by-month?months=${months}`
        );
    },

    // Lấy phân bố auth provider
    getAuthProviderDistribution: () => {
        return axiosClient.get(
            "/admin/users/traffic/auth-provider-distribution"
        );
    },

    // Lấy thống kê login theo kỳ
    getLoginsByPeriod: (period = "day", days = 14) => {
        return axiosClient.get(
            `/admin/users/traffic/logins-by-period?period=${period}&days=${days}`
        );
    },
};

export default trafficService;
