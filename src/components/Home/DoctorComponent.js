import React, { useState, useEffect } from "react";
import { getUserInfo } from "../../utils/auth";
import modelService from "../../services/modelService";
import { uploadImageToS3, deleteImageFromS3 } from "../../services/s3Service";

export default function DoctorComponent() {
    const userInfo = getUserInfo();
    console.log("userInfo: ", userInfo);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [modelInfo, setModelInfo] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [uploadedImageKey, setUploadedImageKey] = useState(null);
    const [uploadedImageOriginalName, setUploadedImageOriginalName] =
        useState(null);
    const [modelAvailable, setModelAvailable] = useState(true);
    // Load model info và kiểm tra availability khi component mount
    useEffect(() => {
        const fetchModelInfo = async () => {
            try {
                const response = await modelService.getModelInfo();
                setModelInfo(response.data);
                console.log("Model info loaded:", response.data);
            } catch (error) {
                console.error("Error loading model info:", error);
                // Fallback nếu không load được
                setModelInfo({ name: "Unknown", version: "v0.0" });
            }
        };

        const checkModelAvailability = async () => {
            try {
                const response = await modelService.modelIsAvailable();
                setModelAvailable(response.data.available);
                console.log("Model availability:", response.data);
            } catch (error) {
                console.error("Error checking model availability:", error);
                setModelAvailable(false);
            }
        };

        fetchModelInfo();
        checkModelAvailability();
    }, []);

    // BI-RADS categories với mô tả
    const biRadsCategories = {
        0: {
            name: "BI-RADS 0",
            description: "Cần đánh giá thêm - Không đầy đủ thông tin",
            color: "bg-gray-100 text-gray-800",
            meaning: "Cần chụp thêm hình ảnh hoặc so sánh với ảnh cũ",
        },
        1: {
            name: "BI-RADS 1",
            description: "Âm tính - Bình thường",
            color: "bg-green-100 text-green-800",
            meaning: "Không có bất thường, tiếp tục tầm soát định kỳ",
        },
        2: {
            name: "BI-RADS 2",
            description: "Tổn thương lành tính",
            color: "bg-blue-100 text-blue-800",
            meaning: "Tổn thương lành tính rõ ràng, tiếp tục tầm soát định kỳ",
        },
        3: {
            name: "BI-RADS 3",
            description: "Có thể lành tính",
            color: "bg-yellow-100 text-yellow-800",
            meaning: "Theo dõi ngắn hạn (6 tháng), xác suất ác tính <2%",
        },
        4: {
            name: "BI-RADS 4",
            description: "Nghi ngờ ác tính",
            color: "bg-orange-100 text-orange-800",
            meaning: "Cần sinh thiết, xác suất ác tính 2-95%",
        },
        5: {
            name: "BI-RADS 5",
            description: "Rất nghi ngờ ác tính",
            color: "bg-red-100 text-red-800",
            meaning: "Cần sinh thiết khẩn cấp, xác suất ác tính >95%",
        },
    };

    // Xử lý drag & drop
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        // Chỉ cho phép drop khi model có sẵn
        if (!modelAvailable) {
            return;
        }

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    };

    // Upload ảnh lên S3 và trả về URL + key
    const uploadImageToServer = async (file) => {
        try {
            console.log("📤 Bắt đầu upload file:", file.name);

            // Upload trực tiếp lên S3 với progress tracking
            const result = await uploadImageToS3(file, (progress) => {
                console.log(`📊 Upload progress: ${progress}%`);
                // Anh có thể thêm progress bar ở đây
            });

            console.log("✅ Upload thành công:", result);
            return {
                url: result.url,
                key: result.key,
                originalName: result.originalName,
            }; // Trả về cả URL và key của ảnh trên S3
        } catch (error) {
            console.error("❌ Lỗi upload:", error);
            throw error; // Ném lỗi để handle ở nơi gọi
        }
    };

    const handleImageUpload = (file) => {
        if (file && file.type.startsWith("image/")) {
            setSelectedImage(file);

            // Tạo preview local
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Reset prediction và upload state khi chọn ảnh mới
            setPrediction(null);
            setUploadedImageUrl(null);
            setUploadedImageKey(null);
            setUploadedImageOriginalName(null);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };

    // Gọi API dự đoán thật
    const handlePredict = async () => {
        if (!selectedImage) {
            alert("Vui lòng chọn ảnh trước!");
            return;
        }

        setIsLoading(true);

        try {
            const startTime = Date.now();

            // Upload ảnh lên S3 trước khi predict
            console.log("📤 Bắt đầu upload ảnh lên S3...");
            const uploadResult = await uploadImageToServer(selectedImage);
            setUploadedImageUrl(uploadResult.url);
            setUploadedImageKey(uploadResult.key);
            setUploadedImageOriginalName(uploadResult.originalName);
            console.log("✅ Upload S3 thành công:", uploadResult);

            console.log("truoc khi gủi api predit:\n", {
                doctor_id: userInfo.user_id,
                image_url: uploadResult.url,
                image_original_name: uploadResult.originalName,
                image_key: uploadResult.key,
                model_name: modelInfo.name,
            });
            // Gọi API predict
            const response = await modelService.predict({
                doctor_id: userInfo.user_id,
                image_url: uploadResult.url,
                image_original_name: uploadResult.originalName,
                image_key: uploadResult.key,
                model_name: modelInfo.name,
            });

            const endTime = Date.now();
            const processingTime = ((endTime - startTime) / 1000).toFixed(1);

            console.log("Prediction response:", response.data);

            // Xử lý response từ API (giờ là object thay vì array)
            const probabilities = response.data;

            // Tìm class có xác suất cao nhất
            const maxProbIndex = probabilities.indexOf(
                Math.max(...probabilities)
            );
            const maxProbability = probabilities[maxProbIndex];

            // Tạo prediction object
            const predictionResult = {
                predictions: probabilities.map((prob, index) => ({
                    class: index,
                    probability: prob,
                })),
                predicted_class: maxProbIndex,
                confidence: maxProbability,
                processing_time: `${processingTime}s`,
            };

            console.log("Processed prediction:", predictionResult);
            setPrediction(predictionResult);
        } catch (error) {
            console.error("Error during prediction:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config,
            });

            alert("Lỗi kết nối API. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetAll = async () => {
        // Xóa ảnh trên S3 nếu có
        // if (uploadedImageKey) {
        //     try {
        //         console.log("🗑️ Đang xóa ảnh trên S3:", uploadedImageKey);
        //         await deleteImageFromS3(uploadedImageKey);
        //         console.log("✅ Đã xóa ảnh trên S3 thành công");
        //     } catch (error) {
        //         console.error("❌ Lỗi khi xóa ảnh trên S3:", error);
        //     }
        // }

        // Reset tất cả state
        setSelectedImage(null);
        setImagePreview(null);
        setPrediction(null);
        setUploadedImageUrl(null);
        setUploadedImageKey(null);
        setUploadedImageOriginalName(null);

        // Reset input file để có thể chọn lại cùng một file
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = "";
        }
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
                        Hệ thống Dự đoán AI - BI-RADS
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Upload ảnh X-quang vú để nhận dự đoán BI-RADS với độ
                        chính xác cao từ hệ thống AI
                    </p>

                    {/* Model Info Display */}
                    {modelInfo && (
                        <div className="mt-4 inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Model: {modelInfo.name}_{modelInfo.version}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Upload & Image */}
                    <div className="space-y-6">
                        {/* Upload Area */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
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
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                                Upload ảnh X-quang
                            </h2>

                            <div
                                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
                                    modelAvailable
                                        ? dragActive
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                                        : "border-gray-300 bg-gray-100"
                                }`}
                                onDragEnter={
                                    modelAvailable ? handleDrag : undefined
                                }
                                onDragLeave={
                                    modelAvailable ? handleDrag : undefined
                                }
                                onDragOver={
                                    modelAvailable ? handleDrag : undefined
                                }
                                onDrop={handleDrop}
                            >
                                {!imagePreview ? (
                                    <>
                                        <svg
                                            className="w-16 h-16 text-gray-400 mx-auto mb-6"
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
                                        {modelAvailable ? (
                                            <div className="space-y-4">
                                                <p className="text-lg text-gray-700 font-medium">
                                                    Kéo thả ảnh vào đây hoặc
                                                </p>
                                                <label className="cursor-pointer">
                                                    <span className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium shadow-sm">
                                                        <svg
                                                            className="w-5 h-5 mr-2"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                            />
                                                        </svg>
                                                        Chọn file ảnh
                                                    </span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={
                                                            handleFileSelect
                                                        }
                                                    />
                                                </label>
                                                <p className="text-sm text-gray-500">
                                                    Hỗ trợ: JPG, JPEG, PNG • Tối
                                                    đa 10MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 text-center">
                                                <div className="text-red-500 mb-4">
                                                    <svg
                                                        className="w-16 h-16 mx-auto mb-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-lg text-red-600 font-medium">
                                                    Model bị lỗi, không thể
                                                    upload ảnh để dự đoán
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Vui lòng liên hệ admin để
                                                    kích hoạt model AI
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-64 mx-auto rounded-lg shadow-md"
                                        />

                                        {/* Upload Status */}
                                        <div className="text-sm text-gray-600">
                                            {uploadedImageUrl ? (
                                                <div className="flex items-center justify-center text-green-600">
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Ảnh đã tải lên S3
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center text-blue-600">
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Ảnh đã sẵn sàng để dự đoán
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={resetAll}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                                            >
                                                Đổi ảnh khác
                                            </button>
                                            {!prediction && (
                                                <button
                                                    onClick={handlePredict}
                                                    disabled={
                                                        isLoading ||
                                                        !selectedImage
                                                    }
                                                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <svg
                                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                ></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                            Đang upload & dự
                                                            đoán...
                                                        </>
                                                    ) : (
                                                        "Upload & Dự đoán"
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Thông báo dự đoán thành công */}
                                        {prediction && !isLoading && (
                                            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                                                <div className="flex items-center justify-center text-green-700">
                                                    <svg
                                                        className="w-5 h-5 mr-2"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span className="font-medium">
                                                        Dự đoán thành công!
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Results */}
                    <div className="space-y-6">
                        {/* Prediction Results */}
                        {prediction && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                    Kết quả dự đoán AI
                                    {prediction.error && (
                                        <span className="ml-2 text-sm text-red-600 font-normal">
                                            (Dữ liệu mẫu - Lỗi API)
                                        </span>
                                    )}
                                </h3>

                                {/* Main Prediction */}
                                <div
                                    className={`p-4 rounded-lg mb-6 ${
                                        biRadsCategories[
                                            prediction.predicted_class
                                        ].color
                                    }`}
                                >
                                    <div className="text-center">
                                        <h4 className="text-2xl font-bold mb-2">
                                            {
                                                biRadsCategories[
                                                    prediction.predicted_class
                                                ].name
                                            }
                                        </h4>
                                        <p className="text-lg font-semibold mb-2">
                                            {
                                                biRadsCategories[
                                                    prediction.predicted_class
                                                ].description
                                            }
                                        </p>
                                        <p className="text-sm">
                                            {
                                                biRadsCategories[
                                                    prediction.predicted_class
                                                ].meaning
                                            }
                                        </p>
                                        <div className="mt-3">
                                            <span className="text-sm font-medium">
                                                Độ tin cậy:{" "}
                                            </span>
                                            <span className="text-lg font-bold">
                                                {(
                                                    prediction.confidence * 100
                                                ).toFixed(1)}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Probability Distribution */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900">
                                        Phân bố xác suất các lớp BI-RADS:
                                    </h4>
                                    {prediction.predictions.map((pred) => (
                                        <div
                                            key={pred.class}
                                            className="space-y-2"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {
                                                        biRadsCategories[
                                                            pred.class
                                                        ].name
                                                    }
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {(
                                                        pred.probability * 100
                                                    ).toFixed(1)}
                                                    %
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full transition-all duration-500 ${
                                                        pred.class ===
                                                        prediction.predicted_class
                                                            ? "bg-blue-600"
                                                            : "bg-gray-400"
                                                    }`}
                                                    style={{
                                                        width: `${
                                                            pred.probability *
                                                            100
                                                        }%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Processing Info */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>
                                            Thời gian xử lý:{" "}
                                            {prediction.processing_time}
                                        </span>
                                        <span>
                                            Mô hình:{" "}
                                            {modelInfo
                                                ? `${modelInfo.name}_${modelInfo.version}`
                                                : "Unknown"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BI-RADS Guide */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
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
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Thông tin về BI-RADS
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(biRadsCategories).map(
                                    ([key, category]) => (
                                        <div
                                            key={key}
                                            className={`p-3 rounded-lg ${category.color}`}
                                        >
                                            <div className="font-semibold">
                                                {category.name}:{" "}
                                                {category.description}
                                            </div>
                                            <div className="text-sm mt-1">
                                                {category.meaning}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
