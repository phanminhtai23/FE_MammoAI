import React, { useState, useEffect } from "react";
import {
    Modal,
    Button,
    Input,
    Select,
    Pagination,
    Spin,
    message,
    Form,
    Switch,
    Upload,
} from "antd";
import dayjs from "dayjs";
import modelService from "../../services/modelService";
import predictionService from "../../services/predictionService";
import { uploadModelToS3 } from "../../services/s3Service";
import {
    Edit,
    Trash2,
    Eye,
    Settings,
    Plus,
    TrendingUp,
    TrendingDown,
    Zap,
    Upload as UploadIcon,
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
} from "recharts";

// Đăng ký Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const PAGE_SIZE = 8;

const PredictManagement = () => {
    // State cho models
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedModel, setSelectedModel] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmActiveModalOpen, setIsConfirmActiveModalOpen] =
        useState(false);
    const [isConfirmInactiveModalOpen, setIsConfirmInactiveModalOpen] =
        useState(false);
    const [isConfirmActivateModalOpen, setIsConfirmActivateModalOpen] =
        useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [activateId, setActivateId] = useState(null);
    const [activating, setActivating] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();

    // State cho thống kê
    const [classStats, setClassStats] = useState(null);
    const [dailyStats, setDailyStats] = useState([]);
    const [averageConfidence, setAverageConfidence] = useState(0);
    const [statsLoading, setStatsLoading] = useState(false);
    const [selectedDays, setSelectedDays] = useState(7);

    // State cho upload file
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState("");

    // Fetch models
    const fetchModels = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: PAGE_SIZE,
            };

            const response = await modelService.getModelsAdmin(params);
            if (response.data) {
                setModels(response.data);
                setTotal(response.data.length); // Giả sử API trả về array
            }
        } catch (error) {
            message.error(
                "Không thể tải danh sách model: " +
                    (error.response?.data?.detail || error.message)
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch thống kê
    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const [classResponse, dailyResponse, confidenceResponse] =
                await Promise.all([
                    predictionService.getPredictions({ limit: 10000 }), // Lấy tất cả predictions
                    predictionService.getPredictionDailyStats(selectedDays),
                    predictionService.getAdminAverageConfidence(), // Lấy xác suất trung bình
                ]);

            // Fix lỗi response format và debug
            console.log("Class response:", classResponse);
            console.log("Daily response:", dailyResponse);
            console.log("Confidence response:", confidenceResponse);

            // Xử lý class stats giống MammoManagement.js
            if (classResponse.data.success) {
                const predictions = classResponse.data.data; // Lấy data array, không phải total
                const classStats = {
                    class_stats: {},
                    total_images: classResponse.data.total,
                };

                // Đếm số lượng từng class giống MammoManagement.js
                predictions.forEach((item) => {
                    if (item.prediction_result) {
                        const result = item.prediction_result;
                        classStats.class_stats[result] =
                            (classStats.class_stats[result] || 0) + 1;
                    }
                });

                setClassStats(classStats);
            }

            // Xử lý daily stats từ backend
            if (dailyResponse.data && dailyResponse.data.success) {
                setDailyStats(dailyResponse.data.data);
            } else if (dailyResponse.data && dailyResponse.data.data) {
                setDailyStats(dailyResponse.data.data);
            } else if (dailyResponse.data) {
                setDailyStats(dailyResponse.data);
            }

            // Xử lý average confidence
            if (confidenceResponse.data && confidenceResponse.data.success) {
                setAverageConfidence(
                    confidenceResponse.data.data.average_confidence || 0
                );
            } else if (confidenceResponse.data) {
                setAverageConfidence(
                    confidenceResponse.data.data.average_confidence || 0
                );
            }

            console.log("Final classStats:", classStats);
            console.log("Final dailyStats:", dailyStats);
            console.log("Final averageConfidence:", averageConfidence);
            console.log(
                "Daily stats format:",
                dailyStats && dailyStats.length > 0 ? dailyStats[0] : "No data"
            );
        } catch (error) {
            console.error("Lỗi fetch stats:", error);
            message.error(
                "Không thể tải thống kê: " +
                    (error.response?.data?.detail || error.message)
            );
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchModels(currentPage);
    }, [currentPage]);

    useEffect(() => {
        fetchStats();
    }, [selectedDays]);

    useEffect(() => {
        console.log("classStats changed:", classStats);
    }, [classStats]);

    useEffect(() => {
        console.log("dailyStats changed:", dailyStats);
    }, [dailyStats]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDetail = (model) => {
        setSelectedModel(model);
        setIsDetailModalOpen(true);
    };

    const handleEdit = (model) => {
        setSelectedModel(model);
        editForm.setFieldsValue({
            name: model.name,
            version: model.version,
            url: model.url,
            accuracy: model.accuracy,
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleActivate = (modelId) => {
        setActivateId(modelId);
        setIsConfirmActivateModalOpen(true);
    };

    const confirmActivate = async () => {
        // Tắt modal confirm ngay lập tức
        setIsConfirmActivateModalOpen(false);
        setActivateId(null);

        setActivating(true);
        console.log("Bắt đầu kích hoạt model...");
        try {
            await modelService.activateModelAdmin(activateId);
            message.success("Kích hoạt model thành công");
            fetchModels(currentPage);
        } catch (error) {
            message.error(
                "Không thể kích hoạt model: " +
                    (error.response?.data?.detail || error.message)
            );
        } finally {
            setActivating(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await modelService.deleteModelAdmin(deleteId);
            message.success("Xóa model thành công");
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            fetchModels(currentPage);
        } catch (error) {
            message.error(
                "Không thể xóa model: " +
                    (error.response?.data?.detail || error.message)
            );
        }
    };

    const handleCreate = async (values) => {
        try {
            // Nếu is_active = true, hiển thị modal xác nhận
            if (values.is_active) {
                setIsConfirmActiveModalOpen(true);
                return;
            }

            await modelService.createModelAdmin(values);
            message.success("Tạo model thành công");
            setIsCreateModalOpen(false);
            form.resetFields();
            setUploadedFile(null);
            setUploadedFileUrl("");
            fetchModels(currentPage);
        } catch (error) {
            message.error(
                "Không thể tạo model: " +
                    (error.response?.data?.detail || error.message)
            );
        }
    };

    const confirmCreateActive = async () => {
        // Tắt modal confirm ngay lập tức
        setIsConfirmActiveModalOpen(false);

        setConfirmLoading(true);
        try {
            // Upload file lên S3 trực tiếp từ frontend
            const uploadResult = await uploadModelToS3(uploadedFile);

            if (uploadResult.success) {
                const values = form.getFieldsValue();

                // Tạo object với đúng format API
                const modelData = {
                    name: values.name,
                    version: values.version,
                    accuracy: values.accuracy,
                    model_url: uploadResult.url,
                    model_key: uploadResult.key,
                    model_original_name: uploadResult.originalName,
                    is_active: true,
                };

                await modelService.createModelAdmin(modelData);
                message.success("Tạo model thành công và đã kích hoạt");
                setIsCreateModalOpen(false);
                form.resetFields();
                setUploadedFile(null);
                setUploadedFileUrl("");
                fetchModels(currentPage);
            } else {
                message.error("Không thể tải model lên S3");
            }
        } catch (error) {
            message.error(
                "Không thể tạo model: " +
                    (error.response?.data?.detail || error.message)
            );
        } finally {
            setConfirmLoading(false);
        }
    };

    const confirmCreateInactive = async () => {
        // Tắt modal confirm ngay lập tức
        setIsConfirmInactiveModalOpen(false);

        setConfirmLoading(true);
        try {
            // Upload file lên S3 trực tiếp từ frontend
            const uploadResult = await uploadModelToS3(uploadedFile);

            if (uploadResult.success) {
                const values = form.getFieldsValue();

                // Tạo object với đúng format API
                const modelData = {
                    name: values.name,
                    version: values.version,
                    accuracy: values.accuracy,
                    model_url: uploadResult.url,
                    model_key: uploadResult.key,
                    model_original_name: uploadResult.originalName,
                    is_active: false,
                };

                await modelService.createModelAdmin(modelData);
                message.success("Tạo model thành công");
                setIsCreateModalOpen(false);
                form.resetFields();
                setUploadedFile(null);
                setUploadedFileUrl("");
                fetchModels(currentPage);
            } else {
                message.error("Không thể tải model lên S3");
            }
        } catch (error) {
            message.error(
                "Không thể tạo model: " +
                    (error.response?.data?.detail || error.message)
            );
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleUpdate = async (values) => {
        try {
            await modelService.updateModelAdmin(selectedModel.id, values);
            message.success("Cập nhật model thành công");
            setIsEditModalOpen(false);
            editForm.resetFields();
            fetchModels(currentPage);
        } catch (error) {
            message.error(
                "Không thể cập nhật model: " +
                    (error.response?.data?.detail || error.message)
            );
        }
    };

    // Upload file lên S3
    const handleUpload = async (file) => {
        setUploadedFile(file);
        return false; // Prevent default upload
    };

    // Xác nhận upload và tạo model
    const handleConfirmUpload = async () => {
        if (!uploadedFile) {
            message.error("Vui lòng chọn file model trước!");
            return;
        }

        const values = form.getFieldsValue();

        // Kiểm tra form validation
        try {
            await form.validateFields();
        } catch (error) {
            message.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        // Hiển thị confirm tùy theo is_active
        if (values.is_active) {
            setIsConfirmActiveModalOpen(true);
        } else {
            setIsConfirmInactiveModalOpen(true);
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat("vi-VN").format(num);
    };

    // Tính toán thống kê tăng/giảm
    const getTodayStats = () => {
        if (dailyStats.length < 2) return { count: 0, change: 0, percent: 0 };

        // Lấy ngày hôm nay theo múi giờ Việt Nam (+7)
        const vietnamToday = new Date();
        vietnamToday.setHours(vietnamToday.getHours() + 7);
        const todayDateStr = vietnamToday.toISOString().split("T")[0]; // Format: YYYY-MM-DD

        console.log("🔍 Vietnam today:", todayDateStr);
        console.log("🔍 Daily stats:", dailyStats);

        // Tìm dữ liệu cho ngày hôm nay (ngày cuối cùng trong 7 ngày gần nhất)
        const today = dailyStats[dailyStats.length - 1]?.count || 0;

        // Tìm dữ liệu cho ngày hôm qua (ngày thứ 6 trong 7 ngày gần nhất)
        const yesterday = dailyStats[dailyStats.length - 2]?.count || 0;

        const change = today - yesterday;
        const percent = yesterday > 0 ? (change / yesterday) * 100 : 0;

        console.log("🔍 Today count (last day):", today);
        console.log("🔍 Yesterday count (second last day):", yesterday);
        console.log("🔍 Change:", change);
        console.log(
            "🔍 7 days range:",
            dailyStats.map((item) => item.date)
        );

        return { count: today, change, percent };
    };

    const todayStats = getTodayStats();

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-100 shadow-xl w-full h-screen flex flex-col overflow-hidden relative">
            {/* Loading overlay khi đang kích hoạt */}
            {activating && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    style={{
                        pointerEvents: "none",
                        zIndex: 9999,
                    }}
                >
                    <div
                        className="bg-white rounded-lg p-6 flex flex-col items-center"
                        style={{ pointerEvents: "auto" }}
                    >
                        <Spin size="large" />
                        <p className="mt-4 text-gray-600">
                            Đang kích hoạt model...
                        </p>
                    </div>
                </div>
            )}

            {/* Loading overlay khi đang tạo model */}
            {confirmLoading && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    style={{
                        pointerEvents: "none",
                        zIndex: 9999,
                    }}
                >
                    <div
                        className="bg-white rounded-lg p-6 flex flex-col items-center"
                        style={{ pointerEvents: "auto" }}
                    >
                        <Spin size="large" />
                        <p className="mt-4 text-gray-600">Đang tạo model...</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-lg">
                            <Settings size={24} className="text-white" />
                        </div>
                        <div className="text-gray-800 font-bold text-xl">
                            Admin Dashboard
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            type="primary"
                            icon={<Plus size={16} />}
                            onClick={() => setIsCreateModalOpen(true)}
                            className="!bg-gradient-to-r !from-green-500 !to-emerald-500 !border-0 !shadow-sm hover:!shadow-md"
                        >
                            Thêm Model
                        </Button>
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 rounded-full text-white font-medium">
                            Quản lý Model AI
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="px-4 py-3 flex-1 overflow-hidden">
                <Spin spinning={statsLoading}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                        {/* Biểu đồ cột - Phân bố class */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-800 font-medium">
                                    Phân bố Predictions theo Class
                                </h3>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {classStats &&
                                            classStats.class_stats
                                                ? Object.values(
                                                      classStats.class_stats
                                                  ).reduce((a, b) => a + b, 0)
                                                : 0}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Tổng predictions
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {averageConfidence.toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Xác suất trung bình
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {statsLoading ? (
                                <div
                                    style={{ height: "250px" }}
                                    className="flex items-center justify-center"
                                >
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <div style={{ height: "250px" }}>
                                    <Bar
                                        data={{
                                            labels: [
                                                "BI-RADS 0",
                                                "BI-RADS 1",
                                                "BI-RADS 2",
                                                "BI-RADS 3",
                                                "BI-RADS 4",
                                                "BI-RADS 5",
                                            ],
                                            datasets: [
                                                {
                                                    label: "Số lượng ảnh",
                                                    data: [
                                                        classStats
                                                            ?.class_stats?.[
                                                            "BI-RADS 0"
                                                        ] || 0,
                                                        classStats
                                                            ?.class_stats?.[
                                                            "BI-RADS 1"
                                                        ] || 0,
                                                        classStats
                                                            ?.class_stats?.[
                                                            "BI-RADS 2"
                                                        ] || 0,
                                                        classStats
                                                            ?.class_stats?.[
                                                            "BI-RADS 3"
                                                        ] || 0,
                                                        classStats
                                                            ?.class_stats?.[
                                                            "BI-RADS 4"
                                                        ] || 0,
                                                        classStats
                                                            ?.class_stats?.[
                                                            "BI-RADS 5"
                                                        ] || 0,
                                                    ],
                                                    backgroundColor: "#3b82f6", // Màu xanh dương
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    ticks: {
                                                        stepSize: 1,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Biểu đồ đường - Predictions theo ngày */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-800 font-medium">
                                    Predictions theo ngày
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-indigo-600">
                                            {todayStats.count}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Hôm nay
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className={`text-sm font-medium flex items-center gap-1 ${
                                                todayStats.change >= 0
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {todayStats.change >= 0 ? (
                                                <TrendingUp size={14} />
                                            ) : (
                                                <TrendingDown size={14} />
                                            )}
                                            {Math.abs(todayStats.change)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {Math.abs(
                                                todayStats.percent
                                            ).toFixed(1)}
                                            %
                                        </div>
                                    </div>
                                    <Select
                                        value={selectedDays}
                                        onChange={setSelectedDays}
                                        size="small"
                                        style={{ width: 100 }}
                                        options={[
                                            { value: 7, label: "7 ngày" },
                                            { value: 14, label: "14 ngày" },
                                            { value: 30, label: "30 ngày" },
                                        ]}
                                    />
                                </div>
                            </div>
                            {statsLoading ? (
                                <div
                                    style={{ height: "200px" }}
                                    className="flex items-center justify-center"
                                >
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart
                                        data={
                                            dailyStats && dailyStats.length > 0
                                                ? dailyStats.map((item) => ({
                                                      date: item.date,
                                                      count: item.count,
                                                  }))
                                                : []
                                        }
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#E5E7EB"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#6B7280"
                                            fontSize={10}
                                        />
                                        <YAxis stroke="#6B7280" fontSize={10} />
                                        <RechartsTooltip
                                            formatter={(value) => [
                                                formatNumber(value),
                                                "Predictions",
                                            ]}
                                            contentStyle={{
                                                backgroundColor: "white",
                                                border: "1px solid #E5E7EB",
                                                borderRadius: "8px",
                                                boxShadow:
                                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#8B5CF6"
                                            strokeWidth={3}
                                            dot={{
                                                fill: "#8B5CF6",
                                                strokeWidth: 2,
                                                r: 4,
                                            }}
                                            activeDot={{
                                                r: 6,
                                                stroke: "#8B5CF6",
                                                strokeWidth: 2,
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </Spin>
            </div>

            {/* Models Table - CỐ ĐỊNH CHIỀU CAO */}
            <div className="px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
                <div
                    className="border border-gray-200 shadow-sm bg-white overflow-hidden rounded-lg"
                    style={{ height: "226px" }}
                >
                    <Spin spinning={loading}>
                        <div
                            className="overflow-y-auto"
                            style={{ height: "226px" }}
                        >
                            <table className="w-full bg-white">
                                <thead className="bg-gradient-to-r from-purple-50 to-indigo-50 sticky top-0 z-10">
                                    <tr className="border-b border-gray-200">
                                        <th className="py-3 px-4 text-center text-gray-700 font-semibold text-sm uppercase tracking-wider w-12">
                                            STT
                                        </th>
                                        <th className="py-3 px-4 text-left text-gray-700 font-semibold text-sm uppercase tracking-wider w-32">
                                            Tên Model
                                        </th>
                                        <th className="py-3 px-4 text-left text-gray-700 font-semibold text-sm uppercase tracking-wider w-24">
                                            Version
                                        </th>
                                        <th className="py-3 px-4 text-left text-gray-700 font-semibold text-sm uppercase tracking-wider w-24">
                                            Accuracy
                                        </th>
                                        <th className="py-3 px-4 text-center text-gray-700 font-semibold text-sm uppercase tracking-wider w-24">
                                            Trạng thái
                                        </th>
                                        <th className="py-3 px-4 text-left text-gray-700 font-semibold text-sm uppercase tracking-wider w-48">
                                            Ngày tạo
                                        </th>
                                        <th className="py-3 px-4 text-center text-gray-700 font-semibold text-sm uppercase tracking-wider w-40">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {models.map((model, index) => (
                                        <tr
                                            key={model.id}
                                            className={`hover:bg-purple-50/50 transition-all duration-200 ${
                                                index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-gray-50/30"
                                            }`}
                                        >
                                            <td className="py-3 px-4 text-gray-800 truncate text-center font-medium">
                                                {(currentPage - 1) * PAGE_SIZE +
                                                    index +
                                                    1}
                                            </td>
                                            <td className="py-4 px-6 text-gray-800 truncate font-medium">
                                                {model.name}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 truncate">
                                                {model.version}
                                            </td>
                                            <td className="py-4 px-6 text-gray-800 truncate">
                                                {model.accuracy
                                                    ? `${model.accuracy}%`
                                                    : "N/A"}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        model.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {model.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 truncate text-sm">
                                                {dayjs(model.created_at).format(
                                                    "DD/MM/YYYY HH:mm"
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!model.is_active && (
                                                        <Button
                                                            icon={
                                                                <Zap
                                                                    size={16}
                                                                />
                                                            }
                                                            className="!bg-green-100 !text-green-700 hover:!bg-green-200 !border-0 !shadow-sm hover:!shadow-md transition-all"
                                                            onClick={() =>
                                                                handleActivate(
                                                                    model.id
                                                                )
                                                            }
                                                            size="small"
                                                            title="Kích hoạt"
                                                        />
                                                    )}
                                                    <Button
                                                        icon={<Eye size={16} />}
                                                        className="!bg-blue-100 !text-blue-700 hover:!bg-blue-200 !border-0 !shadow-sm hover:!shadow-md transition-all"
                                                        onClick={() =>
                                                            handleDetail(model)
                                                        }
                                                        size="small"
                                                        title="Xem chi tiết"
                                                    />
                                                    <Button
                                                        icon={
                                                            <Edit size={16} />
                                                        }
                                                        className="!bg-yellow-100 !text-yellow-700 hover:!bg-yellow-200 !border-0 !shadow-sm hover:!shadow-md transition-all"
                                                        onClick={() =>
                                                            handleEdit(model)
                                                        }
                                                        size="small"
                                                        title="Chỉnh sửa"
                                                    />

                                                    <Button
                                                        icon={
                                                            <Trash2 size={16} />
                                                        }
                                                        className="!bg-red-100 !text-red-700 hover:!bg-red-200 !border-0 !shadow-sm hover:!shadow-md transition-all"
                                                        onClick={() =>
                                                            handleDelete(
                                                                model.id
                                                            )
                                                        }
                                                        size="small"
                                                        title="Xóa"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Spin>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-3">
                    <div className="text-sm text-gray-600">
                        Hiển thị{" "}
                        <span className="font-medium">
                            {(currentPage - 1) * PAGE_SIZE + 1}
                        </span>{" "}
                        đến{" "}
                        <span className="font-medium">
                            {Math.min(currentPage * PAGE_SIZE, total)}
                        </span>{" "}
                        của <span className="font-medium">{total}</span> kết quả
                    </div>
                    <Pagination
                        current={currentPage}
                        pageSize={PAGE_SIZE}
                        total={total}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                    />
                </div>
            </div>

            {/* Modal xem chi tiết model */}
            <Modal
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={null}
                title="Chi tiết Model"
                width={600}
            >
                {selectedModel && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    ID:
                                </label>
                                <p className="text-gray-800">
                                    {selectedModel.id}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    Tên Model:
                                </label>
                                <p className="text-gray-800 font-medium">
                                    {selectedModel.name}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    Version:
                                </label>
                                <p className="text-gray-800">
                                    {selectedModel.version}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    Accuracy:
                                </label>
                                <p className="text-gray-800">
                                    {selectedModel.accuracy
                                        ? `${selectedModel.accuracy}%`
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    Trạng thái:
                                </label>
                                <p className="text-gray-800">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            selectedModel.is_active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {selectedModel.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">
                                    URL:
                                </label>
                                <p className="text-gray-800 text-sm break-all">
                                    {selectedModel.model_url}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Ngày tạo:
                            </label>
                            <p className="text-gray-800">
                                {dayjs(selectedModel.created_at).format(
                                    "DD/MM/YYYY HH:mm"
                                )}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">
                                Ngày cập nhật:
                            </label>
                            <p className="text-gray-800">
                                {dayjs(selectedModel.updated_at).format(
                                    "DD/MM/YYYY HH:mm"
                                )}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal tạo model */}
            <Modal
                open={isCreateModalOpen}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    form.resetFields();
                    setUploadedFile(null);
                    setUploadedFileUrl("");
                }}
                footer={null}
                title="Thêm Model Mới"
                width={500}
            >
                <Form form={form} onFinish={handleCreate} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên Model"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn hoặc nhập tên model!",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn hoặc nhập tên model"
                            showSearch
                            allowClear
                            options={[
                                { value: "ResNet50", label: "ResNet50" },
                                { value: "MobileNetV2", label: "MobileNetV2" },
                                { value: "InceptionV3", label: "InceptionV3" },
                            ]}
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="version"
                        label="Version"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập version!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập version" />
                    </Form.Item>
                    <Form.Item
                        name="url"
                        label="Model File"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng tải model lên S3!",
                            },
                        ]}
                    >
                        <div className="space-y-2">
                            <Upload
                                beforeUpload={handleUpload}
                                showUploadList={false}
                                accept=".pt,.pth,.onnx,.pb,.h5,.pkl"
                            >
                                <Button
                                    icon={<UploadIcon size={16} />}
                                    className="!bg-blue-500 !text-white hover:!bg-blue-600"
                                >
                                    Chọn Model File
                                </Button>
                            </Upload>
                            {uploadedFile && (
                                <div className="text-sm text-gray-600">
                                    Đã chọn: {uploadedFile.name}
                                </div>
                            )}
                            {uploadedFileUrl && (
                                <div className="text-sm text-green-600">
                                    ✅ Đã tải lên S3: {uploadedFileUrl}
                                </div>
                            )}
                        </div>
                    </Form.Item>
                    <Form.Item
                        name="accuracy"
                        label="Accuracy (%)"
                        rules={[
                            {
                                required: false,
                                validator: (_, value) => {
                                    if (
                                        value === undefined ||
                                        value === null ||
                                        value === ""
                                    ) {
                                        return Promise.resolve();
                                    }
                                    const num = parseFloat(value);
                                    if (isNaN(num)) {
                                        return Promise.reject(
                                            new Error("Accuracy phải là số!")
                                        );
                                    }
                                    if (num < 0 || num > 100) {
                                        return Promise.reject(
                                            new Error("Accuracy phải từ 0-100%")
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input
                            type="number"
                            placeholder="Nhập accuracy (0-100)"
                            step="0.1"
                            min="0"
                            max="100"
                        />
                    </Form.Item>
                    <Form.Item
                        name="is_active"
                        label="Kích hoạt ngay"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="Có"
                            unCheckedChildren="Không"
                        />
                    </Form.Item>
                    <Form.Item className="mb-0">
                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    form.resetFields();
                                    setUploadedFile(null);
                                    setUploadedFileUrl("");
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                loading={uploading}
                                className="!bg-gradient-to-r !from-purple-500 !to-indigo-500 !border-0"
                                onClick={handleConfirmUpload}
                            >
                                {uploading
                                    ? "Đang tải lên..."
                                    : "Tải lên S3 & Tạo Model"}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chỉnh sửa model */}
            <Modal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null}
                title="Chỉnh sửa Model"
                width={500}
            >
                <Form form={editForm} onFinish={handleUpdate} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên Model"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên model!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên model" />
                    </Form.Item>
                    <Form.Item
                        name="version"
                        label="Version"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập version!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập version" />
                    </Form.Item>
                    <Form.Item
                        name="accuracy"
                        label="Accuracy (%)"
                        rules={[
                            {
                                required: false,
                                validator: (_, value) => {
                                    if (
                                        value === undefined ||
                                        value === null ||
                                        value === ""
                                    ) {
                                        return Promise.resolve();
                                    }
                                    const num = parseFloat(value);
                                    if (isNaN(num)) {
                                        return Promise.reject(
                                            new Error("Accuracy phải là số!")
                                        );
                                    }
                                    if (num < 0 || num > 100) {
                                        return Promise.reject(
                                            new Error("Accuracy phải từ 0-100%")
                                        );
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input
                            type="number"
                            placeholder="Nhập accuracy (0-100)"
                            step="0.1"
                            min="0"
                            max="100"
                        />
                    </Form.Item>
                    <Form.Item className="mb-0">
                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setIsEditModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="!bg-gradient-to-r !from-purple-500 !to-indigo-500 !border-0"
                            >
                                Cập nhật
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal xác nhận tạo model active */}
            <Modal
                open={isConfirmActiveModalOpen}
                onCancel={() =>
                    !confirmLoading && setIsConfirmActiveModalOpen(false)
                }
                onOk={confirmCreateActive}
                okText="Xác nhận"
                cancelText="Hủy"
                title="Xác nhận tạo và kích hoạt model"
                okType="primary"
                confirmLoading={confirmLoading}
                maskClosable={!confirmLoading}
                closable={!confirmLoading}
            >
                <div className="space-y-2">
                    <p>
                        Bạn có chắc chắn muốn tạo model mới và kích hoạt ngay
                        không?
                    </p>
                    <p className="text-sm text-gray-600">
                        Khi kích hoạt model này, tất cả các model khác sẽ bị vô
                        hiệu hóa.
                    </p>
                </div>
            </Modal>

            {/* Modal xác nhận tạo model inactive */}
            <Modal
                open={isConfirmInactiveModalOpen}
                onCancel={() =>
                    !confirmLoading && setIsConfirmInactiveModalOpen(false)
                }
                onOk={confirmCreateInactive}
                okText="Xác nhận"
                cancelText="Hủy"
                title="Xác nhận tạo model"
                okType="primary"
                confirmLoading={confirmLoading}
                maskClosable={!confirmLoading}
                closable={!confirmLoading}
            >
                <div className="space-y-2">
                    <p>Bạn có chắc chắn muốn tạo model mới không?</p>
                    <p className="text-sm text-gray-600">
                        Model sẽ được tạo nhưng chưa được kích hoạt.
                    </p>
                </div>
            </Modal>

            {/* Modal xác nhận kích hoạt model */}
            <Modal
                open={isConfirmActivateModalOpen}
                onCancel={() => setIsConfirmActivateModalOpen(false)}
                onOk={confirmActivate}
                okText="Kích hoạt"
                cancelText="Hủy"
                title="Xác nhận kích hoạt model"
                okType="primary"
            >
                <div className="space-y-2">
                    <p>Bạn có chắc chắn muốn kích hoạt model này không?</p>
                    <p className="text-sm text-gray-600">
                        Khi kích hoạt model này, tất cả các model khác sẽ bị vô
                        hiệu hóa.
                    </p>
                </div>
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal
                open={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onOk={confirmDelete}
                okText="Xóa"
                cancelText="Hủy"
                title="Xác nhận xóa model"
                okType="danger"
            >
                <div>Bạn có chắc chắn muốn xóa model này không?</div>
            </Modal>
        </div>
    );
};

export default PredictManagement;
