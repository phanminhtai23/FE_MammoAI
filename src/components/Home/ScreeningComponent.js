import React, { useState } from "react";

const ScreeningComponent = ({ setActiveTab }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showResult, setShowResult] = useState(false);

    // Biến để điều khiển hiển thị số điểm (true = hiển thị, false = ẩn)
    const [showPoints, setShowPoints] = useState(false);

    const [formData, setFormData] = useState({
        q1: "", // Bạn có từng cho con bú trong thời gian dưới 12 tháng không?
        q2: "", // Bạn có ít tập thể dục (ít hơn 30 phút/ngày hoặc không đều đặn) không?
        q3: "", // Bạn có sinh con đầu lòng sau 30 tuổi, hoặc chưa sinh con, hoặc sinh con nhưng không đủ tháng?
        q4: "", // Bạn có đang sử dụng thuốc ngừa thai thường xuyên?
        q5: "", // Bạn có uống rượu thường xuyên (hơn 10g alcohol/lần)?
        q6: "", // Bạn có mô tuyến vú dày (kết quả từ nhũ ảnh/siêu âm)?
        q7: "", // Bạn có đang dùng phương pháp hormone phối hợp (estrogen + progesterone)?
        q8: "", // Bạn có chỉ số BMI (cân nặng/chiều cao bình phương) trên 30 (béo phì)?
        q9: "", // Bạn có kinh nguyệt trước 12 tuổi?
        q10: "", // Bạn mãn kinh sau 55 tuổi?
        q11: "", // Bạn có tiền sử bệnh lành tính tuyến vú như tăng sản không điển hình, ung thư tiểu thùy tại chỗ hoặc các bệnh lý khác?
        q12: "", // Bạn từ 40 tuổi trở lên?
        q13: "", // Bạn (hoặc người thân ruột thịt) đã được phát hiện có đột biến gen liên quan ung thư vú (BRAC1, BRCA2, TP53, PTEN, ATM, BRIP1, PALB2, CDH1, STK11,...)
        q14: "", // Gia đình bạn có mẹ, chị/em ruột bị ung thư vú hoặc buồng trứng dưới 50 tuổi?
        q15: "", // Gia đình có nhiều người (cô, dì, bà ngoại/nội) bị ung thư vú hoặc buồng trứng?
        q16: "", // Bạn từng xạ trị vùng ngực trước tuổi 30?
    });

    const questions = [
        {
            id: "q1",
            question:
                "Bạn có từng cho con bú trong thời gian dưới 12 tháng không?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q2",
            question:
                "Bạn có ít tập thể dục (ít hơn 30 phút/ngày hoặc không đều đặn) không?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q3",
            question:
                "Bạn sinh con đầu lòng sau 30 tuổi, hoặc chưa sinh con, hoặc sinh con nhưng không đủ tháng?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q4",
            question: "Bạn có đang sử dụng thuốc ngừa thai thường xuyên?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q5",
            question: "Bạn có uống rượu thường xuyên (hơn 10g alcohol/lần)?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q6",
            question: "Bạn có mô tuyến vú dày (kết quả từ nhũ ảnh/siêu âm)?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q7",
            question:
                "Bạn đang sử dụng liệu pháp hormone phối hợp (estrogen + progesterone)?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q8",
            question:
                "Bạn có chỉ số BMI (cân nặng/chiều cao bình phương) trên 30 (béo phì)?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q9",
            question: "Bạn có kinh nguyệt trước 12 tuổi?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q10",
            question: "Bạn mãn kinh sau 55 tuổi?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q11",
            question:
                "Bạn có tiền sử bệnh lành tính tuyến vú như tăng sản không điển hình, ung thư tiểu thùy tại chỗ hoặc các bệnh lý khác?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q12",
            question: "Bạn từ 40 tuổi trở lên?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "1", label: "Có", points: 1 },
            ],
        },
        {
            id: "q13",
            question:
                "Bạn (hoặc người thân ruột thịt) đã được phát hiện có đột biến gen liên quan ung thư vú (BRCA1, BRCA2, TP53, PTEN, ATM, BRIP1, PALB2, CDH1, STK11...)?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "2", label: "Có", points: 2 },
            ],
        },
        {
            id: "q14",
            question:
                "Gia đình bạn có mẹ, chị/em ruột bị ung thư vú hoặc buồng trứng dưới 50 tuổi?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "2", label: "Có", points: 2 },
            ],
        },
        {
            id: "q15",
            question:
                "Gia đình có nhiều người (cô, dì, bà ngoại/nội) bị ung thư vú hoặc buồng trứng?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "2", label: "Có", points: 2 },
            ],
        },
        {
            id: "q16",
            question: "Bạn từng xạ trị vùng ngực trước tuổi 30?",
            type: "radio",
            options: [
                { value: "0", label: "Không", points: 0 },
                { value: "2", label: "Có", points: 2 },
            ],
        },
    ];

    // Chia câu hỏi thành các trang, mỗi trang 6 câu
    const questionsPerPage = 6;
    const totalPages = Math.ceil(questions.length / questionsPerPage);

    // Lấy câu hỏi cho trang hiện tại
    const getCurrentPageQuestions = () => {
        const startIndex = (currentPage - 1) * questionsPerPage;
        const endIndex = startIndex + questionsPerPage;
        return questions.slice(startIndex, endIndex);
    };

    const handleInputChange = (questionId, value) => {
        setFormData((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            // Auto scroll lên container câu hỏi với delay để đảm bảo DOM đã update
            setTimeout(() => {
                const questionsContainer = document.querySelector(
                    ".bg-white.rounded-2xl.shadow-xl"
                );
                if (questionsContainer) {
                    questionsContainer.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                        inline: "nearest",
                    });
                } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            }, 100);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            // Auto scroll lên container câu hỏi với delay để đảm bảo DOM đã update
            setTimeout(() => {
                const questionsContainer = document.querySelector(
                    ".bg-white.rounded-2xl.shadow-xl"
                );
                if (questionsContainer) {
                    questionsContainer.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                        inline: "nearest",
                    });
                } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            }, 100);
        }
    };

    // Kiểm tra xem trang hiện tại đã được trả lời đầy đủ chưa
    const isCurrentPageComplete = () => {
        const currentQuestions = getCurrentPageQuestions();
        return currentQuestions.every(
            (question) => formData[question.id] !== ""
        );
    };

    const calculateRisk = () => {
        let totalPoints = 0;
        questions.forEach((question) => {
            const answer = formData[question.id];
            if (answer) {
                const selectedOption = question.options.find(
                    (opt) => opt.value === answer
                );
                if (selectedOption) {
                    totalPoints += selectedOption.points;
                }
            }
        });
        return totalPoints;
    };

    const getRiskLevel = (points) => {
        if (points <= 6)
            return {
                level: "Nguy cơ thấp",
                color: "green",
                description:
                    "Bạn có nguy cơ thấp mắc ung thư vú. Tiếp tục duy trì lối sống lành mạnh và tầm soát định kỳ.",
            };
        if (points <= 12)
            return {
                level: "Nguy cơ trung bình",
                color: "yellow",
                description:
                    "Bạn có nguy cơ trung bình. Nên theo dõi chặt chẽ và tham khảo ý kiến bác sĩ chuyên khoa.",
            };
        return {
            level: "Nguy cơ cao",
            color: "red",
            description:
                "Bạn có nguy cơ cao mắc ung thư vú. Hãy đặt lịch khám với bác sĩ chuyên khoa ngay để được tư vấn và theo dõi.",
        };
    };

    const handleSubmit = () => {
        const points = calculateRisk();
        setShowResult(true);
    };

    const currentPageQuestions = getCurrentPageQuestions();
    const isLastPage = currentPage === totalPages;
    const isFirstPage = currentPage === 1;
    const progressPercentage = (currentPage / totalPages) * 100;

    // Modal hiển thị kết quả
    const ResultModal = () => {
        const points = calculateRisk();
        const riskInfo = getRiskLevel(points);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div
                                className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                                    riskInfo.color === "green"
                                        ? "bg-green-100"
                                        : riskInfo.color === "yellow"
                                        ? "bg-yellow-100"
                                        : "bg-red-100"
                                }`}
                            >
                                <span className="text-3xl">
                                    {riskInfo.color === "green"
                                        ? "✅"
                                        : riskInfo.color === "yellow"
                                        ? "⚠️"
                                        : "🚨"}
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Kết Quả Tầm Soát
                            </h2>
                            <p className="text-gray-600">
                                Dựa trên câu trả lời của bạn
                            </p>
                        </div>

                        {/* Điểm số */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-6">
                            <div className="text-center">
                                <div className="text-5xl font-bold mb-2 text-blue-600">
                                    {points}
                                </div>
                                <div className="text-gray-600 text-lg">
                                    Tổng điểm nguy cơ
                                </div>
                            </div>
                        </div>

                        {/* Thanh tham chiếu mức độ nguy cơ */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">
                                Bảng Tham Chiếu Mức Độ Nguy Cơ
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <span className="font-medium text-green-800">
                                        0 điểm - 6 điểm
                                    </span>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                        Nguy cơ thấp
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <span className="font-medium text-yellow-800">
                                        7 điểm - 12 điểm
                                    </span>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                        Nguy cơ trung bình
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <span className="font-medium text-red-800">
                                        13 điểm - 20 điểm
                                    </span>
                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                                        Nguy cơ cao
                                    </span>
                                </div>
                            </div>

                            {/* Thanh trượt hiển thị vị trí điểm hiện tại */}
                            <div className="mt-6">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>0</span>
                                    <span>6</span>
                                    <span>12</span>
                                    <span>20</span>
                                </div>
                                <div className="relative">
                                    <div className="h-4 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full"></div>
                                    </div>
                                    {/* Vị trí điểm hiện tại */}
                                    <div
                                        className="absolute top-0 transform -translate-x-1/2 w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                                        style={{
                                            left: `${Math.min(
                                                (points / 20) * 100,
                                                100
                                            )}%`,
                                        }}
                                    >
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    {/* Nhãn điểm hiện tại */}
                                    <div
                                        className="absolute -top-8 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold"
                                        style={{
                                            left: `${Math.min(
                                                (points / 20) * 100,
                                                100
                                            )}%`,
                                        }}
                                    >
                                        {points}
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>Thấp</span>
                                    <span>Trung bình</span>
                                    <span>Cao</span>
                                </div>
                            </div>
                        </div>

                        {/* Mức độ nguy cơ */}
                        <div
                            className={`rounded-xl p-6 mb-6 ${
                                riskInfo.color === "green"
                                    ? "bg-green-50 border border-green-200"
                                    : riskInfo.color === "yellow"
                                    ? "bg-yellow-50 border border-yellow-200"
                                    : "bg-red-50 border border-red-200"
                            }`}
                        >
                            <div className="text-center">
                                <h3
                                    className={`text-2xl font-bold mb-3 ${
                                        riskInfo.color === "green"
                                            ? "text-green-800"
                                            : riskInfo.color === "yellow"
                                            ? "text-yellow-800"
                                            : "text-red-800"
                                    }`}
                                >
                                    {riskInfo.level}
                                </h3>
                                <p
                                    className={`text-lg ${
                                        riskInfo.color === "green"
                                            ? "text-green-700"
                                            : riskInfo.color === "yellow"
                                            ? "text-yellow-700"
                                            : "text-red-700"
                                    }`}
                                >
                                    {riskInfo.description}
                                </p>
                            </div>
                        </div>

                        {/* Tư vấn tầm soát */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                            <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                                <svg
                                    className="w-6 h-6 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Tư Vấn Tầm Soát Ung Thư Vú
                            </h4>

                            {/* Tư vấn cho nguy cơ thấp */}
                            {riskInfo.color === "green" && (
                                <div className="space-y-3 text-blue-800">
                                    <div className="flex items-start">
                                        <span className="text-green-600 mr-2 text-lg">
                                            •
                                        </span>
                                        <span>
                                            <strong>
                                                Bắt đầu tầm soát từ năm 40 tuổi
                                            </strong>
                                        </span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-green-600 mr-2 text-lg">
                                            •
                                        </span>
                                        <span>
                                            <strong>
                                                Phương pháp tầm soát:
                                            </strong>{" "}
                                            Tự khám vú + siêu âm tuyến vú + chụp
                                            nhũ ảnh
                                        </span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-green-600 mr-2 text-lg">
                                            •
                                        </span>
                                        <span>
                                            Duy trì lối sống lành mạnh: tập thể
                                            dục đều đặn, ăn uống cân bằng
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Tư vấn cho nguy cơ trung bình */}
                            {riskInfo.color === "yellow" && (
                                <div className="space-y-3 text-blue-800">
                                    <div className="flex items-start">
                                        <span className="text-yellow-600 mr-2 text-lg">
                                            •
                                        </span>
                                        <span>
                                            <strong>
                                                Bắt đầu tầm soát từ năm 40 tuổi
                                            </strong>
                                        </span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-yellow-600 mr-2 text-lg">
                                            •
                                        </span>
                                        <span>
                                            <strong>
                                                Phương pháp tầm soát:
                                            </strong>{" "}
                                            Tự khám vú + siêu âm tuyến vú + chụp
                                            nhũ ảnh
                                        </span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-yellow-600 mr-2 text-lg">
                                            •
                                        </span>
                                        <span>
                                            Tham khảo ý kiến bác sĩ chuyên khoa
                                            về lịch tầm soát phù hợp
                                        </span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-yellow-600 mr-2 text-lg">
                                            •
                                        </span>
                                        <span>
                                            Duy trì lối sống lành mạnh và giảm
                                            các yếu tố nguy cơ
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Tư vấn cho nguy cơ cao */}
                            {riskInfo.color === "red" && (
                                <div className="space-y-3 text-blue-800">
                                    <div className="flex items-start">
                                        <span className="text-red-600 mr-2 text-lg">
                                            •
                                        </span>
                                        <span>
                                            <strong>
                                                Bắt đầu tầm soát từ năm 25 tuổi
                                            </strong>
                                        </span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-red-600 mr-2 text-lg">
                                            •
                                        </span>
                                        <span>
                                            <strong>
                                                Phương pháp tầm soát:
                                            </strong>{" "}
                                            Tự khám vú + siêu âm tuyến vú + chụp
                                            nhũ ảnh + kết hợp chụp cộng hưởng từ
                                            vú (MRI)
                                        </span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-red-600 mr-2 text-lg">
                                            •
                                        </span>
                                        <span>
                                            Theo dõi chặt chẽ, khám định kỳ 3-6
                                            tháng/lần
                                        </span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-red-600 mr-2">
                                            ⚠️
                                        </span>
                                        <span className="text-red-700 font-semibold">
                                            <strong>
                                                Khuyến cáo khẩn cấp:
                                            </strong>{" "}
                                            Liên hệ với bác sĩ chuyên khoa Ung
                                            bướu ngay để được tư vấn và lập kế
                                            hoạch tầm soát chi tiết
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setShowResult(false)}
                                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition duration-300"
                            >
                                Đóng kết quả
                            </button>
                            <button
                                onClick={() => setActiveTab("home")}
                                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-300"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            {/* Modal kết quả */}
            {showResult && <ResultModal />}

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Title */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                        <svg
                            className="w-8 h-8 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.948.684l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Bảng Tầm Soát Nguy Cơ Ung Thư Vú
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Bảng câu hỏi tầm soát nguy cơ ung thư vú được Bác sĩ uy
                        tín xác nhận tính đúng đắn và khoa học, giúp đánh giá sơ
                        bộ nguy cơ ung thư vú của bạn
                    </p>
                </div>

                {/* Questions Container */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                        <div className="flex items-center">
                            <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                                <span className="text-white text-xl font-bold">
                                    {currentPage}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    Trang {currentPage} / {totalPages}
                                </h2>
                                <p className="text-blue-100">
                                    Vui lòng trả lời tất cả câu hỏi trong trang
                                    này
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Questions Grid */}
                    <div className="p-8">
                        <div className="space-y-8">
                            {currentPageQuestions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className="border-b border-gray-100 pb-6 last:border-b-0"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-start">
                                        <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                                            {(currentPage - 1) *
                                                questionsPerPage +
                                                index +
                                                1}
                                        </span>
                                        <span className="leading-relaxed">
                                            {question.question}
                                        </span>
                                    </h3>

                                    <div className="ml-11 space-y-3">
                                        {question.options.map((option) => (
                                            <label
                                                key={option.value}
                                                className={`group block p-4 border-2 rounded-xl cursor-pointer transition duration-300 hover:border-blue-300 hover:shadow-sm ${
                                                    formData[question.id] ===
                                                    option.value
                                                        ? "border-blue-500 bg-blue-50 shadow-sm"
                                                        : "border-gray-200 bg-white hover:bg-gray-50"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={question.id}
                                                    value={option.value}
                                                    checked={
                                                        formData[
                                                            question.id
                                                        ] === option.value
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            question.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                                <div className="flex items-center">
                                                    <div
                                                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition duration-300 ${
                                                            formData[
                                                                question.id
                                                            ] === option.value
                                                                ? "border-blue-500 bg-blue-500"
                                                                : "border-gray-300 group-hover:border-blue-400"
                                                        }`}
                                                    >
                                                        {formData[
                                                            question.id
                                                        ] === option.value && (
                                                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`text-base font-medium transition duration-300 ${
                                                            formData[
                                                                question.id
                                                            ] === option.value
                                                                ? "text-blue-900"
                                                                : "text-gray-700 group-hover:text-gray-900"
                                                        }`}
                                                    >
                                                        {option.label}
                                                    </span>

                                                    {/* Hiển thị điểm nếu showPoints = true */}
                                                    {showPoints && (
                                                        <div className="ml-auto">
                                                            <span
                                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                                                    option.points ===
                                                                    0
                                                                        ? "bg-green-100 text-green-800"
                                                                        : option.points ===
                                                                          1
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : "bg-red-100 text-red-800"
                                                                }`}
                                                            >
                                                                {option.points}{" "}
                                                                điểm
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
                            <button
                                onClick={handlePrevious}
                                disabled={isFirstPage}
                                className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition duration-300 ${
                                    isFirstPage
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                                }`}
                            >
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
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Trang trước
                            </button>

                            {isLastPage ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isCurrentPageComplete()}
                                    className={`inline-flex items-center px-8 py-3 rounded-xl font-semibold transition duration-300 ${
                                        !isCurrentPageComplete()
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    }`}
                                >
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
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Hoàn thành tầm soát
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    disabled={!isCurrentPageComplete()}
                                    className={`inline-flex items-center px-8 py-3 rounded-xl font-semibold transition duration-300 ${
                                        !isCurrentPageComplete()
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    }`}
                                >
                                    Trang tiếp theo
                                    <svg
                                        className="w-5 h-5 ml-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-8 mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="text-sm text-gray-500">
                            Trang {currentPage} / {totalPages} • Đã hoàn thành{" "}
                            {Math.round(progressPercentage)}%
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Page indicators */}
                    <div className="flex justify-center mt-4">
                        <div className="flex space-x-2">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <div
                                    key={i + 1}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        i + 1 === currentPage
                                            ? "bg-blue-600 scale-125"
                                            : i + 1 < currentPage
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-blue-600"
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
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                Lưu ý quan trọng từ chuyên gia
                            </h3>
                            <div className="text-blue-800 space-y-2">
                                <p>
                                    • Kết quả tầm soát này chỉ mang tính chất{" "}
                                    <strong>
                                        tham khảo và sàng lọc ban đầu
                                    </strong>
                                </p>
                                <p>
                                    • Để có chẩn đoán chính xác, bạn cần{" "}
                                    <strong>
                                        thăm khám trực tiếp với bác sĩ chuyên
                                        khoa Ung bướu
                                    </strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScreeningComponent;
