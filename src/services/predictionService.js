//  services/userService.js
import axiosClient from "./axiosClient";

const predictionService = {
    getPredictionsByDoctorId: (doctorId, page, limit) => {
        return axiosClient.get(
            `/prediction/get-all/${doctorId}?page=${page}&limit=${limit}`
        );
    },

    getPredictions: (params = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Thêm các params
            if (params.page) queryParams.append("page", params.page);
            if (params.limit) queryParams.append("limit", params.limit);
            if (params.search) queryParams.append("search", params.search);
            if (params.model_filter)
                queryParams.append("model_filter", params.model_filter);
            if (params.result_filter)
                queryParams.append("result_filter", params.result_filter);

            return axiosClient.get(
                `/prediction/get-all?${queryParams.toString()}`
            );
        } catch (error) {
            throw error;
        }
    },

    deletePrediction: (predictionId, fileKey) => {
        return axiosClient.delete(
            `/prediction/${predictionId}?file_key=${fileKey}`
        );
    },

    createDataset: (trainPercent, valPercent, testPercent) => {
        return axiosClient.post(
            "/admin/create-dataset-download",
            {
                train_percent: trainPercent,
                val_percent: valPercent,
                test_percent: testPercent,
            },
            { responseType: "blob" }
        );
    },
    // Lấy thống kê predictions theo ngày (Admin only)
    getPredictionDailyStats: (days = 30) => {
        return axiosClient.get(`/prediction/statistics/daily?days=${days}`);
    },

    // getDatasetClassStats: () => {
    //     return axiosClient.get("/admin/dataset/class-stats");
    // },

    getAdminAverageConfidence: () => {
        return axiosClient.get(
            "/prediction/statistics/admin-average-confidence"
        );
    },
};

export default predictionService;
