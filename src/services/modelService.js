//  services/modelService.js
import axiosClient from "./axiosClient";

const modelService = {
    predict: (data) => {
        return axiosClient.post("/model/predict", data);
    },

    getModelInfo: () => {
        return axiosClient.get("/model/infor-model");
    },

    // ===== ADMIN MODEL MANAGEMENT SERVICES =====

    // Lấy danh sách models với filter và pagination (Admin only)
    getModelsAdmin: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = `/model/get-all-models${queryString ? `?${queryString}` : ""}`;
        return axiosClient.get(url);
    },

    // Lấy chi tiết model (Admin only)
    getModelDetailAdmin: (modelId) => {
        return axiosClient.get(`/model/${modelId}`);
    },

    // Tạo model mới (Admin only)
    createModelAdmin: (modelData) => {
        return axiosClient.post("/model/", modelData);
    },

    // Cập nhật model (Admin only)
    updateModelAdmin: (modelId, modelData) => {
        return axiosClient.put(`/model/${modelId}`, modelData);
    },

    // Xóa model (Admin only)
    deleteModelAdmin: (modelId) => {
        return axiosClient.delete(`/model/${modelId}`);
    },

    // Kích hoạt model (Admin only)
    activateModelAdmin: (modelId) => {
        return axiosClient.patch(`/model/${modelId}/activate`);
    },

    // Lấy thống kê predictions theo class (Admin only)
    getPredictionClassStats: () => {
        return axiosClient.get("/admin/dataset/class-stats");
    },

    modelIsAvailable: () => {
        return axiosClient.get("/model/model-is-availabe");
    },
};

export default modelService;
