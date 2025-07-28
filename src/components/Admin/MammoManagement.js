import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Select, Pagination, Spin, message } from "antd";
import dayjs from "dayjs";
import predictionService from "../../services/predictionService";
import { Edit, Trash2, Eye, Settings, Download } from "lucide-react";
import { Slider } from "antd";
import axiosClient from "../../services/axiosClient";
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

const MammoManagement = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [modelFilter, setModelFilter] = useState(null);
    const [resultFilter, setResultFilter] = useState(null);
    const [models, setModels] = useState([]);
    const [resultOptions, setResultOptions] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [fileKey, setFileKey] = useState(null);
    const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
    const [classStats, setClassStats] = useState(null);
    const [trainValTest, setTrainValTest] = useState([70, 90]); // 70% train, 20% val, 10% test
    const [creatingDataset, setCreatingDataset] = useState(false);
    const [datasetInfo, setDatasetInfo] = useState(null);

    // Fetch all predictions for admin
    const fetchPredictions = async (page = 1) => {
        setLoading(true);
        try {
            // Tạo params cho filter
            const params = {
                page,
                limit: PAGE_SIZE,
            };

            // Thêm filter params nếu có
            if (search.trim()) {
                params.search = search.trim();
            }
            if (modelFilter) {
                params.model_filter = modelFilter;
            }
            if (resultFilter) {
                params.result_filter = resultFilter;
            }

            const response = await predictionService.getPredictions(params);
            if (response.data.success) {
                setPredictions(response.data.data);
                setTotal(response.data.total);
            } else {
                message.error("Lỗi khi tải lịch sử dự đoán");
            }
        } catch (error) {
            message.error(
                "Không thể tải lịch sử dự đoán: " +
                    (error.response?.data?.detail || error.message)
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch filter options từ tất cả dữ liệu
    const fetchFilterOptions = async () => {
        try {
            // Lấy tất cả predictions để có đầy đủ options
            const response = await predictionService.getPredictions({
                limit: 10000,
            });
            if (response.data.success) {
                const modelSet = new Set();
                const resultSet = new Set();

                response.data.data.forEach((item) => {
                    if (item.model_name) modelSet.add(item.model_name);
                    if (item.prediction_result)
                        resultSet.add(item.prediction_result);
                });

                // Sắp xếp theo thứ tự BI-RADS
                const biRadsOrder = [
                    "BI-RADS 0",
                    "BI-RADS 1",
                    "BI-RADS 2",
                    "BI-RADS 3",
                    "BI-RADS 4",
                    "BI-RADS 5",
                ];

                const sortedResults = Array.from(resultSet).sort((a, b) => {
                    const aIndex = biRadsOrder.indexOf(a);
                    const bIndex = biRadsOrder.indexOf(b);
                    if (aIndex === -1 && bIndex === -1)
                        return a.localeCompare(b);
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                });

                setModels(Array.from(modelSet).sort());
                setResultOptions(sortedResults);
            }
        } catch (error) {
            console.error("Lỗi khi tải filter options:", error);
        }
    };

    useEffect(() => {
        fetchPredictions(currentPage);
        // eslint-disable-next-line
    }, [currentPage, search, modelFilter, resultFilter]);

    // Fetch filter options khi component mount
    useEffect(() => {
        fetchFilterOptions();
    }, []);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDetail = (prediction) => {
        setSelectedPrediction(prediction);
        setIsDetailModalOpen(true);
    };

    const handleDelete = (id, fileKey) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
        setFileKey(fileKey);
    };

    const confirmDelete = async () => {
        try {
            // Gọi API xóa prediction ở đây (chưa có sẵn, cần backend hỗ trợ)
            await predictionService.deletePrediction(deleteId, fileKey);
            message.success("Xóa dự đoán thành công");
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            fetchPredictions(currentPage);
        } catch (error) {
            message.error(
                "Không thể xóa dự đoán: " +
                    (error.response?.data?.detail || error.message)
            );
        }
    };

    // Fetch class stats
    const fetchClassStats = async () => {
        try {
            const res = await axiosClient.get("/admin/dataset/class-stats");
            if (res.data.status_code === 200) {
                setClassStats(res.data.data);
            }
        } catch (e) {
            message.error("Không thể lấy thống kê lớp");
        }
    };

    // Khi mở modal
    const openDatasetModal = () => {
        fetchClassStats();
        setIsDatasetModalOpen(true);
    };

    // Khi đóng modal - cleanup
    const closeDatasetModal = () => {
        setIsDatasetModalOpen(false);
        setClassStats(null);
        setDatasetInfo(null);
    };

    // Khi xác nhận tạo dataset
    const handleCreateDataset = () => {
        Modal.confirm({
            title: "Xác nhận tạo dataset",
            content: `Bạn có chắc chắn muốn tạo dataset với tỷ lệ Train: ${
                trainValTest[0]
            }%, Val: ${trainValTest[1] - trainValTest[0]}%, Test: ${
                100 - trainValTest[1]
            }% không?`,
            okText: "Tạo",
            cancelText: "Hủy",
            onOk: async () => {
                // Tắt modal confirm ngay lập tức bằng cách return false
                setCreatingDataset(true);

                // Tạo function riêng để xử lý tạo dataset
                const createDatasetProcess = async () => {
                    try {
                        // Sử dụng predictionService.createDataset để tải file về
                        const response = await predictionService.createDataset(
                            trainValTest[0],
                            trainValTest[1] - trainValTest[0],
                            100 - trainValTest[1]
                        );

                        // Tạo link download và tự động tải về
                        const blob = new Blob([response.data], {
                            type: "application/zip",
                        });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "data.zip";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);

                        message.success("Tạo dataset thành công!");
                        setIsDatasetModalOpen(false); // Đóng modal dataset sau khi thành công
                    } catch (e) {
                        message.error("Tạo dataset thất bại!");
                    } finally {
                        setCreatingDataset(false);
                    }
                };

                // Chạy process tạo dataset
                createDatasetProcess();

                // Return false để tắt modal confirm ngay lập tức
                return false;
            },
        });
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white shadow-xl w-full h-screen flex flex-col overflow-hidden relative">
            {/* Loading overlay khi đang tạo dataset */}
            {creatingDataset && (
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
                            Đang tạo dataset...
                        </p>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-200 p-2 bg-gray-100 rounded-lg">
                            <Settings size={24} className="text-gray-600" />
                        </div>
                        <div className="text-gray-800 font-bold text-xl">
                            Admin Dashboard
                        </div>
                    </div>
                    <div className="bg-gray-200 px-4 py-2 rounded-full border border-gray-200">
                        <span className="text-gray-700 font-medium">
                            Quản lý Ảnh Mammo
                        </span>
                    </div>
                </div>
            </div>

            {/* Thanh tìm kiếm và filter */}
            <div className="px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="relative flex-1 max-w-md">
                        <Input
                            placeholder="Tìm kiếm theo tên ảnh..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-4 pr-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 border-0 border-gray-200 focus:shadow-md focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                            style={{ fontSize: "14px" }}
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-6">
                        <div className="text-sm text-gray-500">
                            Tổng số:{" "}
                            <span className="font-semibold text-gray-700">
                                {total}
                            </span>{" "}
                            dự đoán
                        </div>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <div className="text-sm text-gray-500">
                            Trang:{" "}
                            <span className="font-semibold text-gray-700">
                                {currentPage}
                            </span>
                            /{Math.ceil(total / PAGE_SIZE)}
                        </div>
                    </div>
                </div>
                {/* Filter row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Select
                            placeholder="Lọc theo model"
                            allowClear
                            style={{ width: 180 }}
                            value={modelFilter}
                            onChange={(value) => {
                                setModelFilter(value);
                                setCurrentPage(1);
                            }}
                            options={models.map((m) => ({
                                value: m,
                                label: m,
                            }))}
                        />
                        <Select
                            placeholder="Lọc theo kết quả"
                            allowClear
                            style={{ width: 180 }}
                            value={resultFilter}
                            onChange={(value) => {
                                setResultFilter(value);
                                setCurrentPage(1);
                            }}
                            options={resultOptions.map((r) => ({
                                value: r,
                                label: r,
                            }))}
                        />
                        {/* Thêm nút reset filter */}
                        <Button
                            onClick={() => {
                                setSearch("");
                                setModelFilter(null);
                                setResultFilter(null);
                                setCurrentPage(1);
                            }}
                            size="small"
                            className="!bg-gray-100 !text-gray-600 hover:!bg-gray-200"
                        >
                            Reset
                        </Button>
                    </div>
                    {/* Nút tải dữ liệu - bên phải màn hình */}
                    <Button
                        icon={<Download size={18} />}
                        className="!bg-green-500 !text-white hover:!bg-green-600 !border-0 !shadow-sm hover:!shadow-md transition-all"
                        onClick={openDatasetModal}
                    >
                        Tải dữ liệu
                    </Button>
                </div>
            </div>

            {/* Bảng prediction với loading - CỐ ĐỊNH CHIỀU CAO */}
            <div
                style={{
                    height: "calc(100vh - 220px)", // Cố định chiều cao, trừ đi header + filter + pagination
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "auto", // Đảm bảo bảng cuộn được
                }}
                className="border border-gray-200 shadow-sm bg-white overflow-hidden"
            >
                <Spin spinning={loading}>
                    <table className="w-full bg-white table-fixed">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 text-center text-gray-700 font-semibold text-sm uppercase tracking-wider w-12">
                                    STT
                                </th>
                                <th className="py-3 px-4 text-left text-gray-700 font-semibold text-sm uppercase tracking-wider w-32">
                                    Ảnh
                                </th>
                                <th className="py-3 px-4 text-left text-gray-700 font-semibold text-sm uppercase tracking-wider w-32">
                                    Model
                                </th>
                                <th className="py-3 px-4 text-left text-gray-700 font-semibold text-sm uppercase tracking-wider w-32">
                                    Kết quả
                                </th>
                                <th className="py-3 px-4 text-left text-gray-700 font-semibold text-sm uppercase tracking-wider w-32">
                                    Độ tin cậy
                                </th>
                                <th className="py-3 px-4 text-left text-gray-700 font-semibold text-sm uppercase tracking-wider w-48">
                                    Ngày dự đoán
                                </th>
                                <th className="py-3 px-4 text-center text-gray-700 font-semibold text-sm uppercase tracking-wider w-32">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {predictions.map((prediction, index) => (
                                <tr
                                    key={prediction.id}
                                    className={`hover:bg-blue-50/50 transition-all duration-200 ${
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
                                    <td className="py-4 px-6 text-gray-800 truncate">
                                        {prediction.image_url ? (
                                            <img
                                                src={prediction.image_url}
                                                alt={prediction.model_name}
                                                className="w-16 h-16 object-cover rounded-lg border"
                                            />
                                        ) : (
                                            <span className="text-gray-400">
                                                Không có ảnh
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-gray-600 truncate">
                                        {prediction.model_name}
                                    </td>
                                    <td className="py-4 px-6 text-gray-800 truncate">
                                        {prediction.prediction_result}
                                    </td>
                                    <td className="py-4 px-6 text-gray-800 truncate">
                                        {prediction.probability}%
                                    </td>
                                    <td className="py-4 px-6 text-gray-600 truncate text-sm">
                                        {dayjs(prediction.created_at).format(
                                            "DD/MM/YYYY HH:mm"
                                        )}
                                    </td>
                                    <td className="py-4 px-6 flex items-center justify-center gap-2">
                                        <Button
                                            icon={<Eye size={18} />}
                                            className="!bg-blue-100 !text-blue-700 hover:!bg-blue-200 !border-0 !shadow-sm hover:!shadow-md transition-all"
                                            onClick={() =>
                                                handleDetail(prediction)
                                            }
                                            size="small"
                                        />
                                        <Button
                                            icon={<Trash2 size={18} />}
                                            className="!bg-red-100 !text-red-700 hover:!bg-red-200 !border-0 !shadow-sm hover:!shadow-md transition-all"
                                            onClick={() =>
                                                handleDelete(
                                                    prediction.id,
                                                    prediction.image_key
                                                )
                                            }
                                            size="small"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Spin>
            </div>

            {/* Pagination CỐ ĐỊNH Ở DƯỚI CÙNG - CHỈ TRONG PHẦN NỘI DUNG */}
            <div
                className="flex justify-between items-center px-4 py-3 bg-gray-50/50 border-t border-gray-200"
                style={{
                    background: "#f9fafb",
                    minHeight: "60px",
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                }}
            >
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

            {/* Modal xem chi tiết prediction */}
            <Modal
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={null}
                title="Chi tiết dự đoán"
                bodyStyle={{ paddingLeft: 16, paddingRight: 16 }}
            >
                {selectedPrediction && (
                    <div className="space-y-2 px-4">
                        <div className="flex justify-center mb-2">
                            {selectedPrediction.image_url && (
                                <img
                                    src={selectedPrediction.image_url}
                                    alt={selectedPrediction.model_name}
                                    className="w-32 h-32 rounded-lg object-cover border-2 border-blue-400"
                                />
                            )}
                        </div>
                        <div>
                            <b>ID:</b> {selectedPrediction.id}
                        </div>
                        <div>
                            <b>Model:</b> {selectedPrediction.model_name}
                        </div>
                        <div>
                            <b>Kết quả:</b>{" "}
                            {selectedPrediction.prediction_result}
                        </div>
                        <div>
                            <b>Độ tin cậy:</b> {selectedPrediction.probability}%
                        </div>
                        <div>
                            <b>Ngày dự đoán:</b>{" "}
                            {dayjs(selectedPrediction.created_at).format(
                                "DD/MM/YYYY HH:mm"
                            )}
                        </div>
                        <div>
                            <b>Image URL:</b>{" "}
                            <a
                                href={selectedPrediction.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                {selectedPrediction.image_url}
                            </a>
                        </div>
                        <div>
                            <b>Image Key:</b> {selectedPrediction.image_key}
                        </div>
                        <div>
                            <b>Doctor ID:</b> {selectedPrediction.doctor_id}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal
                open={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onOk={confirmDelete}
                okText="Xóa"
                cancelText="Hủy"
                title="Xác nhận xóa dự đoán"
                okType="danger"
            >
                <div>Bạn có chắc chắn muốn xóa dự đoán này không?</div>
            </Modal>

            {/* Modal tạo dataset */}
            <Modal
                open={isDatasetModalOpen}
                onCancel={closeDatasetModal}
                footer={null}
                title="Tạo Dataset"
                width={700}
            >
                {classStats ? (
                    <div>
                        <div className="mb-4 text-lg font-semibold text-center">
                            Tổng số ảnh: {classStats.total_images}
                        </div>
                        {/* Biểu đồ cột */}
                        <div className="mb-6" style={{ height: "300px" }}>
                            <Bar
                                data={{
                                    labels: Object.keys(classStats.class_stats),
                                    datasets: [
                                        {
                                            label: "Số lượng ảnh",
                                            data: Object.values(
                                                classStats.class_stats
                                            ),
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
                        {/* Thanh trượt chia tỷ lệ */}
                        <div className="mb-4">
                            <div className="mb-2 text-sm font-medium">
                                Chia tỷ lệ
                            </div>
                            <div
                                className="relative"
                                style={{ padding: "20px 0 16px 0" }}
                            >
                                <Slider
                                    range
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={trainValTest}
                                    onChange={setTrainValTest}
                                    allowCross={false}
                                    tipFormatter={null}
                                    trackStyle={[
                                        {
                                            background: "transparent",
                                            height: 12,
                                            borderRadius: 8,
                                        },
                                        {
                                            background: "transparent",
                                            height: 12,
                                            borderRadius: 8,
                                        },
                                    ]}
                                    handleStyle={[
                                        {
                                            backgroundColor: "#fff",
                                            border: "2px solid #d1d5db",
                                            width: 20,
                                            height: 20,
                                            borderRadius: "50%",
                                            marginTop: -4,
                                            boxShadow: "0 2px 8px #0001",
                                            zIndex: 2,
                                        },
                                        {
                                            backgroundColor: "#fff",
                                            border: "2px solid #d1d5db",
                                            width: 20,
                                            height: 20,
                                            borderRadius: "50%",
                                            marginTop: -4,
                                            boxShadow: "0 2px 8px #0001",
                                            zIndex: 2,
                                        },
                                    ]}
                                    railStyle={{
                                        height: 12,
                                        borderRadius: 8,
                                        background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${trainValTest[0]}%, #3b82f6 ${trainValTest[0]}%, #3b82f6 ${trainValTest[1]}%, #22c55e ${trainValTest[1]}%, #22c55e 100%)`,
                                        boxShadow: "0 2px 8px #22c55e33",
                                    }}
                                />
                                {/* Label phần trăm sát thanh, có chữ Train/Val/Test */}
                                <div
                                    className="absolute w-full left-0 flex justify-between pointer-events-none select-none"
                                    style={{ top: -8, zIndex: 2 }}
                                >
                                    <div
                                        style={{
                                            width: `${trainValTest[0]}%`,
                                            textAlign: "center",
                                            position: "relative",
                                        }}
                                    >
                                        <span
                                            className="text-red-500 font-bold bg-white px-1 py-0.5 rounded shadow-sm text-xs"
                                            style={{
                                                position: "absolute",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                minWidth: 48,
                                            }}
                                        >
                                            Train: {trainValTest[0]}%
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            width: `${
                                                trainValTest[1] -
                                                trainValTest[0]
                                            }%`,
                                            textAlign: "center",
                                            position: "relative",
                                        }}
                                    >
                                        <span
                                            className="text-blue-500 font-bold bg-white px-1 py-0.5 rounded shadow-sm text-xs"
                                            style={{
                                                position: "absolute",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                minWidth: 48,
                                            }}
                                        >
                                            Val:{" "}
                                            {trainValTest[1] - trainValTest[0]}%
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            width: `${100 - trainValTest[1]}%`,
                                            textAlign: "center",
                                            position: "relative",
                                        }}
                                    >
                                        <span
                                            className="text-green-500 font-bold bg-white px-1 py-0.5 rounded shadow-sm text-xs"
                                            style={{
                                                position: "absolute",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                minWidth: 48,
                                            }}
                                        >
                                            Test: {100 - trainValTest[1]}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                                    <span>Train: {trainValTest[0]}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                    <span>
                                        Val: {trainValTest[1] - trainValTest[0]}
                                        %
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span>Test: {100 - trainValTest[1]}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="primary"
                                loading={creatingDataset}
                                onClick={handleCreateDataset}
                                className="!bg-green-500 !text-white hover:!bg-green-600"
                            >
                                Xác nhận tạo dataset
                            </Button>
                        </div>
                        {datasetInfo && (
                            <div className="mt-4 text-green-600 font-semibold text-center">
                                Đã tạo dataset thành công!
                                <br />
                                Train: {datasetInfo.train_count} - Val:{" "}
                                {datasetInfo.val_count} - Test:{" "}
                                {datasetInfo.test_count}
                            </div>
                        )}
                    </div>
                ) : (
                    <Spin />
                )}
            </Modal>
        </div>
    );
};

export default MammoManagement;
