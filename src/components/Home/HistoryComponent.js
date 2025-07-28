import React, { useState, useEffect } from "react";
import { getUserInfo } from "../../utils/auth";
import predictionService from "../../services/predictionService";
import { Modal, Button, Pagination, Spin, message } from "antd";
import dayjs from "dayjs";

const PAGE_SIZE = 8;

export default function HistoryComponent() {
    const userInfo = getUserInfo();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchPredictions = async (page = 1) => {
        setLoading(true);
        try {
            const response = await predictionService.getPredictionsByDoctorId(
                userInfo.user_id,
                page,
                PAGE_SIZE
            );
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

    useEffect(() => {
        if (userInfo?.user_id) {
            fetchPredictions(currentPage);
        }
        // eslint-disable-next-line
    }, [currentPage, userInfo?.user_id]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDetail = (prediction) => {
        setSelectedPrediction(prediction);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Chào mừng, Bác sĩ {userInfo?.name}
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Lịch sử dự đoán
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Xem lại các kết quả dự đoán BI-RADS đã thực hiện trước
                        đó
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                            <svg
                                className="w-5 h-5 mr-2 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                />
                            </svg>
                            Danh sách dự đoán
                        </h2>
                        <div className="text-sm text-gray-500">
                            Tổng cộng: {total} kết quả
                        </div>
                    </div>

                    <Spin spinning={loading}>
                        {predictions.length === 0 ? (
                            <div className="text-center py-12">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                    />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">
                                    Chưa có lịch sử dự đoán
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Thực hiện dự đoán đầu tiên để xem lịch sử
                                    tại đây.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {predictions.map((prediction, idx) => (
                                    <div
                                        key={prediction.id}
                                        className="flex items-center justify-between p-6 hover:bg-gray-50 transition duration-150"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                {prediction.image_url ? (
                                                    <img
                                                        src={
                                                            prediction.image_url
                                                        }
                                                        alt={
                                                            prediction.image_original_name
                                                        }
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <svg
                                                        className="w-8 h-8 text-blue-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-900 truncate">
                                                    {
                                                        prediction.image_original_name
                                                    }
                                                </div>
                                                <div className="text-gray-500 text-sm truncate">
                                                    {dayjs(
                                                        prediction.created_at
                                                    ).format(
                                                        "DD/MM/YYYY HH:mm"
                                                    )}
                                                </div>
                                                <div className="text-gray-500 text-xs truncate">
                                                    Model:{" "}
                                                    {prediction.model_name}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end min-w-[180px]">
                                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 mb-1">
                                                    {
                                                        prediction.prediction_result
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Độ tin cậy:{" "}
                                                    {prediction.probability}%
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="primary"
                                            className="ml-4"
                                            onClick={() =>
                                                handleDetail(prediction)
                                            }
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Spin>

                    {/* Pagination */}
                    <div className="flex justify-between items-center px-4 py-3 bg-gray-50/50 border-t border-gray-200 flex-shrink-0">
                        <div className="text-sm text-gray-600">
                            Hiển thị
                            <span className="font-medium">
                                {" "}
                                {(currentPage - 1) * PAGE_SIZE + 1}{" "}
                            </span>
                            đến
                            <span className="font-medium">
                                {" "}
                                {Math.min(currentPage * PAGE_SIZE, total)}{" "}
                            </span>
                            của <span className="font-medium">{total}</span> kết
                            quả
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
                                        alt={
                                            selectedPrediction.image_original_name
                                        }
                                        className="w-32 h-32 rounded-lg object-cover border-2 border-blue-400"
                                    />
                                )}
                            </div>
                            <div>
                                <b>ID:</b> {selectedPrediction.id}
                            </div>
                            <div>
                                <b>Tên ảnh:</b>{" "}
                                {selectedPrediction.image_original_name}
                            </div>
                            <div>
                                <b>Model:</b> {selectedPrediction.model_name}
                            </div>
                            <div>
                                <b>Kết quả:</b>{" "}
                                {selectedPrediction.prediction_result}
                            </div>
                            <div>
                                <b>Độ tin cậy:</b>{" "}
                                {selectedPrediction.probability}%
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
            </div>
        </div>
    );
}
