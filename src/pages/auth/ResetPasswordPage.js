import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Alert, Spin } from "antd";
import {
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    KeyOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import userService from "../../services/userService";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const { token } = useParams(); // Lấy token từ URL params
    const [searchParams] = useSearchParams(); // Hoặc từ query params
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(true); // Loading khi check token
    const [submitLoading, setSubmitLoading] = useState(false); // Loading khi submit
    const [tokenValid, setTokenValid] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Lấy token từ URL (có thể là params hoặc query)
    const resetToken = token || searchParams.get("token");

    // Check token validity khi component mount
    useEffect(() => {
        if (!resetToken) {
            setErrorMessage("Link đặt lại mật khẩu không hợp lệ!");
            setLoading(false);
            return;
        }

        checkTokenValidity();
    }, [resetToken]);

    // Kiểm tra token có hợp lệ không
    const checkTokenValidity = async () => {
        try {
            setLoading(true);

            // Gọi API kiểm tra token
            const response = await userService.verifyResetToken({
                token: resetToken,
            });
            console.log("response:", response);
            if (response.status === 200 && response.data.payload) {
                setTokenValid(true);
                setUserEmail(response.data.payload.sub);
                // message.success("Token hợp lệ! Vui lòng nhập mật khẩu mới.");
            }
        } catch (error) {
            console.log("error:", error);
            console.error("Token verification error:", error);

            const errorMsg = error.response?.data?.detail || error.message;

            if (errorMsg && errorMsg.includes("expired")) {
                setErrorMessage(
                    "Link đặt lại mật khẩu đã hết hạn! Vui lòng yêu cầu link mới."
                );
            } else if (errorMsg && errorMsg.includes("invalid")) {
                setErrorMessage("Link đặt lại mật khẩu không hợp lệ!");
            } else {
                setErrorMessage(
                    "Có lỗi xảy ra khi xác thực link! Vui lòng thử lại."
                );
            }

            setTokenValid(false);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý đặt lại mật khẩu
    const handleResetPassword = async (values) => {
        try {
            setSubmitLoading(true);

            const response = await userService.resetPassword({
                token: resetToken,
                new_password: values.password,
                confirm_password: values.confirmPassword,
            });

            if (response.status === 200) {
                message.success("Đặt lại mật khẩu thành công!");

                // Chờ 2 giây rồi chuyển về login
                setTimeout(() => {
                    navigate("/login", {
                        state: {
                            message:
                                "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới!",
                        },
                    });
                }, 2000);
            }
        } catch (error) {
            console.log("error:", error);
            if (error.response.status === 401) {
                message.error("Link đã hết hạn! Vui lòng yêu cầu link mới.");
                setTokenValid(false);
                setErrorMessage("Link đặt lại mật khẩu đã hết hạn!");
            } else if (error.response.status === 400) {
                message.error("Lỗi khi đặt lại mật khẩu!");
                setErrorMessage("Lỗi khi đặt lại mật khẩu!");
            } else {
                message.error("Có lỗi xảy ra! Vui lòng thử lại.");
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    // Format email để hiển thị
    const formatEmail = (email) => {
        if (!email) return "";
        const [username, domain] = email.split("@");
        if (username.length <= 3) return email;
        const hiddenUsername =
            username.slice(0, 2) +
            "*".repeat(Math.max(username.length - 4, 1)) +
            username.slice(-2);
        return `${hiddenUsername}@${domain}`;
    };

    // Render loading state
    const renderLoading = () => (
        <div className="text-center">
            <Spin size="large" />
            <p className="text-gray-600 mt-4">
                Đang xác thực link đặt lại mật khẩu...
            </p>
        </div>
    );

    // Render error state (token invalid/expired)
    const renderError = () => (
        <>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <ExclamationCircleOutlined className="text-red-600 text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                    Link đã hết hạn!
                </h2>
            </div>

            {/* Error Alert */}
            <Alert
                message="❌ Lỗi xác thực"
                description={errorMessage}
                type="error"
                showIcon={false}
                className="mb-6"
            />

            {/* Instructions */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                <p className="text-yellow-800 text-sm font-semibold mb-2">
                    💡 Giải pháp:
                </p>
                <ul className="text-yellow-700 text-sm space-y-1 ml-4">
                    <li>• Yêu cầu link đặt lại mật khẩu mới</li>
                    <li>• Link chỉ có hiệu lực trong 10 phút</li>
                </ul>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
                <Button
                    type="primary"
                    block
                    className="h-12 rounded-lg bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate("/forgot-password")}
                >
                    Yêu Cầu Link Mới
                </Button>

                <Button
                    block
                    className="h-12 rounded-lg"
                    onClick={() => navigate("/login")}
                >
                    Quay Về Đăng Nhập
                </Button>
            </div>
        </>
    );

    // Render reset password form
    const renderResetForm = () => (
        <>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <KeyOutlined className="text-green-600 text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                    Đặt Lại Mật Khẩu
                </h2>
                <p className="text-gray-500 mt-2">
                    Nhập mật khẩu mới cho tài khoản của bạn
                </p>
                {userEmail && (
                    <p className="text-green-600 font-semibold mt-2">
                        📧 {formatEmail(userEmail)}
                    </p>
                )}
            </div>

            {/* Password Form */}
            <Form
                form={form}
                onFinish={handleResetPassword}
                layout="vertical"
                requiredMark={false}
            >
                <Form.Item
                    name="password"
                    label="Mật khẩu mới"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập mật khẩu mới!",
                        },
                        {
                            min: 8,
                            message: "Mật khẩu phải có ít nhất 8 ký tự!",
                        },
                        {
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message:
                                "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!",
                        },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="Nhập mật khẩu mới"
                        iconRender={(visible) =>
                            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                        className="h-12 rounded-lg"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    dependencies={["password"]}
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng xác nhận mật khẩu!",
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (
                                    !value ||
                                    getFieldValue("password") === value
                                ) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(
                                    new Error("Mật khẩu xác nhận không khớp!")
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="Xác nhận mật khẩu mới"
                        iconRender={(visible) =>
                            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                        className="h-12 rounded-lg"
                        size="large"
                    />
                </Form.Item>

                <Form.Item className="mb-6">
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        className="h-12 rounded-lg bg-green-600 hover:bg-green-700 transition text-lg font-semibold"
                        loading={submitLoading}
                        icon={<CheckCircleOutlined />}
                    >
                        {submitLoading
                            ? "Đang cập nhật..."
                            : "Đặt Lại Mật Khẩu"}
                    </Button>
                </Form.Item>
            </Form>

            {/* Password Requirements */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm font-semibold mb-2">
                    📋 Yêu cầu mật khẩu:
                </p>
                <ul className="text-blue-700 text-xs space-y-1 ml-4">
                    <li>• Ít nhất 8 ký tự</li>
                    <li>• Chứa ít nhất 1 chữ hoa (A-Z)</li>
                    <li>• Chứa ít nhất 1 chữ thường (a-z)</li>
                    <li>• Chứa ít nhất 1 số (0-9)</li>
                </ul>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-300 flex items-center justify-center px-4">
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-md">
                <div className="p-8">
                    {/* Render theo trạng thái */}
                    {loading
                        ? renderLoading()
                        : !tokenValid
                        ? renderError()
                        : renderResetForm()}

                    {/* Footer - chỉ hiển thị khi không loading */}
                    {!loading && (
                        <div className="text-center mt-6 pt-6 border-t border-gray-200">
                            <p className="text-gray-600 text-sm">
                                Nhớ mật khẩu rồi?{" "}
                                <button
                                    onClick={() => navigate("/login")}
                                    className="text-blue-600 hover:text-blue-800 font-semibold transition cursor-pointer"
                                >
                                    Đăng nhập ngay
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
