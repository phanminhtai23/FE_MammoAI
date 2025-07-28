import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { MailOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate, Link, useLocation } from "react-router-dom";
import userService from "../../services/userService";

const VerifyCodePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [verificationCode, setVerificationCode] = useState([
        "",
        "",
        "",
        "",
        "",
        "",
    ]);

    // Lấy email từ state hoặc localStorage
    const email = location.state?.email || "";
    const msg = location.state?.message || "";
    // Đếm ngược cho nút gửi lại mã
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Xử lý thay đổi input cho từng ô nhập mã
    const handleInputChange = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode);

            // Tự động focus vào ô tiếp theo
            if (value && index < 5) {
                const nextInput = document.getElementById(`code-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    // Xử lý phím Backspace
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    // Xử lý paste mã 6 số
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);
        if (pastedData.length === 6) {
            setVerificationCode(pastedData.split(""));
            // Focus vào ô cuối cùng
            const lastInput = document.getElementById("code-5");
            if (lastInput) lastInput.focus();
        }
    };

    // Xử lý xác nhận mã
    const handleVerifyCode = async () => {
        const code = verificationCode.join("");

        if (code.length !== 6) {
            message.warning({
                content: "Vui lòng nhập đầy đủ 6 chữ số!",
                duration: 2,
            });
            return;
        }

        if (!email) {
            message.error({
                content: "Không tìm thấy email. Vui lòng đăng ký lại!",
                duration: 2,
            });
            navigate("/register");
            return;
        }

        try {
            setLoading(true);

            const response = await userService.verifyCode({
                email: email,
                code: code,
            });

            if (response.status === 200) {
                message.success({
                    content:
                        "Xác nhận thành công! Vui lòng đăng nhập để vào hệ thống!",
                    duration: 2,
                });

                // Chuyển hướng đến trang đăng nhập
                navigate("/login", {
                    state: {
                        message:
                            "Tài khoản của bạn đã được xác nhận. Vui lòng đăng nhập!",
                    },
                });
            }
        } catch (error) {
            message.error({
                content: error.response.data.detail,
                duration: 2,
            });
            // console.error("Lỗi xác nhận:", error);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý gửi lại mã
    const handleResendCode = async () => {
        if (!canResend || !email) return;

        try {
            setResendLoading(true);

            const response = await userService.sendVerificationCode({
                email: email,
            });

            if (response.status === 200) {
                message.success({
                    content: "Mã xác nhận mới đã được gửi đến email của bạn!",
                    duration: 2,
                });

                // Reset countdown
                setCountdown(60);
                setCanResend(false);

                // Clear current code
                setVerificationCode(["", "", "", "", "", ""]);

                // Focus vào ô đầu tiên
                const firstInput = document.getElementById("code-0");
                if (firstInput) firstInput.focus();
            }
        } catch (error) {
            message.error({
                content: error.response.data.detail,
                duration: 2,
            });

            console.error("Lỗi gửi lại mã:", error);
        } finally {
            setResendLoading(false);
        }
    };

    // Format email để hiển thị (ẩn một phần)
    const formatEmail = (email) => {
        if (!email) return "";
        const [username, domain] = email.split("@");
        const hiddenUsername =
            username.slice(0, 2) + "*".repeat(username.length - 2);
        return `${hiddenUsername}@${domain}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-300 flex items-center justify-center px-4">
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-md">
                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <MailOutlined className="text-blue-600 text-2xl" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            {msg}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Chúng tôi đã gửi mã xác nhận 6 chữ số đến
                        </p>
                        <p className="text-blue-600 font-semibold mt-1">
                            {formatEmail(email)}
                        </p>
                    </div>

                    {/* Code Input */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                            Nhập mã xác nhận
                        </label>
                        <div
                            className="flex justify-center space-x-3"
                            onPaste={handlePaste}
                        >
                            {verificationCode.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`code-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) =>
                                        handleInputChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="0"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Verify Button */}
                    <Form.Item>
                        <Button
                            type="primary"
                            block
                            className="h-12 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-lg font-semibold"
                            loading={loading}
                            onClick={handleVerifyCode}
                            icon={<CheckCircleOutlined />}
                        >
                            {loading ? "Đang xác nhận..." : "Xác Nhận"}
                        </Button>
                    </Form.Item>

                    {/* Resend Section */}
                    <div className="text-center">
                        <p className="text-gray-600 text-sm mb-3">
                            Không nhận được mã?
                        </p>

                        {canResend ? (
                            <Button
                                type="link"
                                className="text-blue-600 hover:text-blue-800 font-semibold p-0"
                                loading={resendLoading}
                                onClick={handleResendCode}
                            >
                                {resendLoading
                                    ? "Đang gửi..."
                                    : "Gửi lại mã xác nhận"}
                            </Button>
                        ) : (
                            <div className="text-gray-500 text-sm">
                                Gửi lại sau{" "}
                                <span className="font-bold text-blue-600">
                                    {countdown}s
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Back to Register */}
                    <div className="text-center mt-6 pt-6 border-t border-gray-200">
                        <p className="text-gray-600 text-sm">
                            Sai email?{" "}
                            <Link
                                to="/register"
                                className="text-blue-600 hover:text-blue-800 font-semibold transition"
                            >
                                Đăng ký lại
                            </Link>
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-xs text-center">
                            💡 <strong>Lưu ý:</strong> Mã xác nhận có hiệu lực
                            trong 10 phút. Vui lòng kiểm tra cả thư mục
                            spam/junk email nếu không thấy email xác nhận.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyCodePage;
