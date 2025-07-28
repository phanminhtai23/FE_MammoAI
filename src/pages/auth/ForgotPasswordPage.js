import React, { useState } from "react";
import { Form, Input, Button, message, Alert } from "antd";
import {
    MailOutlined,
    SendOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import userService from "../../services/userService";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [sentEmail, setSentEmail] = useState("");

    // Xử lý gửi email reset password
    const handleSendResetEmail = async (values) => {
        try {
            setLoading(true);

            // Gọi API gửi email reset password
            const response = await userService.forgotPassword({
                email: values.email,
            });

            // Nếu thành công
            if (response.status === 200 || response.success) {
                setSentEmail(values.email);
                setEmailSent(true);
                message.success("Email đặt lại mật khẩu đã được gửi!");
            }
        } catch (error) {
            // Handle các lỗi từ server
            console.log(error);
            const errorMessage = error.response?.data?.detail || error.message;

            if (errorMessage) {
                if (
                    errorMessage.includes("không tìm thấy") ||
                    errorMessage.includes("not found")
                ) {
                    message.error("Email này không tồn tại trong hệ thống!");
                } else if (
                    errorMessage.includes("chưa xác thực") ||
                    errorMessage.includes("not verified")
                ) {
                    message.error(
                        "Email này chưa được xác thực! Vui lòng xác thực email trước."
                    );
                } else {
                    message.error(errorMessage);
                }
            } else {
                message.error("Có lỗi xảy ra! Vui lòng thử lại sau.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Format email để hiển thị (ẩn một phần)
    const formatEmail = (email) => {
        if (!email) return "";
        const [username, domain] = email.split("@");
        if (username.length <= 3) return email; // Email ngắn thì không ẩn
        const hiddenUsername =
            username.slice(0, 2) +
            "*".repeat(Math.max(username.length - 4, 1)) +
            username.slice(-2);
        return `${hiddenUsername}@${domain}`;
    };

    // Render form nhập email
    const renderEmailForm = () => (
        <>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <MailOutlined className="text-orange-600 text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                    Quên Mật Khẩu?
                </h2>
                <p className="text-gray-500 mt-2">
                    Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
                </p>
            </div>

            {/* Email Form */}
            <Form
                form={form}
                onFinish={handleSendResetEmail}
                layout="vertical"
                requiredMark={false}
            >
                <Form.Item
                    name="email"
                    label="Địa chỉ Email"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập email!",
                        },
                        {
                            type: "email",
                            message: "Email không đúng định dạng!",
                        },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined className="text-gray-400" />}
                        placeholder="Nhập email đã đăng ký"
                        className="h-12 rounded-lg"
                        size="large"
                        autoComplete="email"
                    />
                </Form.Item>

                <Form.Item className="mb-6">
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        className="h-12 rounded-lg bg-orange-600 hover:bg-orange-700 transition text-lg font-semibold"
                        loading={loading}
                        icon={<SendOutlined />}
                    >
                        {loading ? "Đang gửi..." : "Xác nhận"}
                    </Button>
                </Form.Item>
            </Form>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                    💡 <strong>Lưu ý:</strong> Chúng tôi sẽ gửi link đặt lại mật
                    khẩu đến email của bạn. Vui lòng kiểm tra cả thư mục
                    spam/junk nếu không thấy email.
                </p>
            </div>
        </>
    );

    // Render thông báo đã gửi email
    const renderEmailSentMessage = () => (
        <>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircleOutlined className="text-green-600 text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                    Email Đã Được Gửi!
                </h2>
                <p className="text-gray-500 mt-2">
                    Vui lòng kiểm tra email để hoàn tất việc đặt lại mật khẩu
                </p>
            </div>

            {/* Success Alert */}
            <Alert
                message="✅ Đã gửi mail đặt lại mật khẩu"
                description={
                    <div className="mt-2">
                        <p className="mb-3">
                            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <p className="font-semibold text-green-700 text-center">
                                📧 {formatEmail(sentEmail)}
                            </p>
                        </div>
                        <p className="text-sm text-gray-600">
                            <strong>⏰ Thời hạn:</strong> Link đặt lại mật khẩu
                            có hiệu lực trong <strong>10 phút</strong>.
                        </p>
                    </div>
                }
                type="success"
                showIcon={false}
                className="mb-6"
            />

            {/* Instructions */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                <p className="text-yellow-800 text-sm font-semibold mb-2">
                    📋 Hướng dẫn tiếp theo:
                </p>
                <ol className="text-yellow-700 text-sm space-y-1 ml-4">
                    <li>1. Mở email trong hộp thư của bạn</li>
                    <li>2. Click vào link "Đặt lại mật khẩu"</li>
                    <li>3. Nhập mật khẩu mới theo yêu cầu</li>
                    <li>4. Đăng nhập với mật khẩu mới</li>
                </ol>
                <p className="text-yellow-600 text-xs mt-3">
                    💡 <strong>Mẹo:</strong> Nếu không thấy email, hãy kiểm tra
                    thư mục spam/junk
                </p>
            </div>

            {/* Resend Option */}
            <div className="text-center">
                <p className="text-gray-600 text-sm mb-3">
                    Không nhận được email?
                </p>
                <Button
                    type="link"
                    className="text-orange-600 hover:text-orange-800 font-semibold p-0"
                    onClick={() => {
                        setEmailSent(false);
                        form.setFieldsValue({ email: sentEmail });
                    }}
                >
                    Gửi lại email
                </Button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-300 flex items-center justify-center px-4">
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-md">
                <div className="p-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Button
                            type="link"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/login")}
                            className="text-gray-600 hover:text-gray-800 p-0 font-medium"
                        >
                            Quay lại đăng nhập
                        </Button>
                    </div>

                    {/* Render theo trạng thái */}
                    {emailSent ? renderEmailSentMessage() : renderEmailForm()}

                    {/* Footer */}
                    <div className="text-center mt-6 pt-6 border-t border-gray-200">
                        <p className="text-gray-600 text-sm">
                            Chưa có tài khoản?{" "}
                            <Link
                                to="/register"
                                className="text-orange-600 hover:text-orange-800 font-semibold transition"
                            >
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
