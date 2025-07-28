import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Modal, Alert } from "antd";
import {
    GoogleOutlined,
    FacebookOutlined,
    LockOutlined,
    UserOutlined,
    ExclamationCircleOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import userService from "../../services/userService";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { isAuthenticated, getUserInfo } from "../../utils/auth";

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errorVisible, setErrorVisible] = useState(false);

    // Auto redirect nếu đã đăng nhập
    useEffect(() => {
        if (isAuthenticated()) {
            const userInfo = getUserInfo();
            message.success(
                `Chào mừng trở lại, ${userInfo?.name || userInfo?.email}!`
            );

            // Redirect dựa trên role
            if (userInfo?.role === "admin") {
                navigate("/dashboard");
            } else {
                navigate("/home");
            }
        }
    }, [navigate]);

    // Handle Google login
    const loginGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const response = await userService.googleLogin({
                    token: tokenResponse.access_token,
                });
                console.log("response:", response);
                localStorage.setItem("token", response.data.access_token);
                // Trigger storage event để cập nhật navigation
                window.dispatchEvent(new Event("storage"));
                if (response.data.user.role === "admin") {
                    navigate("/dashboard");
                } else {
                    navigate("/home");
                }
            } catch (error) {
                console.log("error:", error);
                // Xử lý các loại lỗi và hiển thị popup
                // sai tài khoản hoặc mật khẩu
                if (!error.response && error.message) {
                    // lỗi kết nối
                    message.error(error.message, 2);
                } else if (error.response.status) {
                    // sai tài khoản hoặc mật khẩu hay bị khóa tài khoản
                    message.error(error.response.data.detail, 2);
                } else if (error.request) {
                    // lỗi kết nối
                    message.error("Lỗi kết nối đến máy chủ", 2);
                } else {
                    // lỗi kết nối
                    message.error("Đăng nhập thất bại", 2);
                }
            }
        },
        onError: () => {
            message.error("Google login thất bại", 2);
        },
    });

    // Handle Facebook login
    const handleFacebookLogin = async (res) => {
        try {
            // console.log("accessToken:", res);
            const response = await userService.facebookLogin({
                token: res.accessToken,
            });
            console.log("response:", response);

            localStorage.setItem("token", response.data.access_token);
            // Trigger storage event để cập nhật navigation
            window.dispatchEvent(new Event("storage"));
            if (response.data.user.role === "admin") {
                navigate("/dashboard");
            } else {
                navigate("/home");
            }
        } catch (error) {
            console.log("error:", error);
            // Xử lý các loại lỗi và hiển thị popup
            let msg = "Đăng nhập thất bại";
            // sai tài khoản hoặc mật khẩu
            if (!error.response && error.message) {
                msg = error.message; // lỗi kết nối
            } else if (error.response && error.response.status) {
                msg = error.response.data.detail; // sai tài khoản hoặc mật khẩu hay bị khóa tài khoản
            } else if (error.request) {
                msg = "Lỗi kết nối đến máy chủ";
            } else {
                // Hiển thị popup ở góc trên bên trái trong 2s
                message.error({
                    // type: "error",
                    content: msg,
                    duration: 2,
                });
            }
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await userService.login({
                email: values.email,
                password: values.password,
                device_info: navigator.userAgent,
            });

            localStorage.setItem("token", response.data.access_token);
            // Trigger storage event để cập nhật navigation
            window.dispatchEvent(new Event("storage"));
            if (response.data.user.role === "admin") {
                navigate("/dashboard");
            } else {
                navigate("/home");
            }
        } catch (error) {
            if (
                error.response?.status === 403 &&
                error.response.data.detail === "Tài khoản chưa xác thực"
            ) {
                await userService.sendVerificationCode({ email: values.email });
                navigate("/verify-code", {
                    state: {
                        email: values.email,
                        message: "Tài khoản chưa xác thực",
                        confirmed: false,
                    },
                });
                return;
            }

            if (error.response?.data?.detail) {
                message.error(error.response.data.detail, 2);
            } else if (error.message) {
                message.error(error.message, 2);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleErrorClose = () => {
        setErrorVisible(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center px-4 relative">
            {/* Nút quay về trang chủ */}
            <Link
                to="/"
                className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-50 group"
            >
                <ArrowLeftOutlined className="text-blue-600 text-lg group-hover:text-blue-800" />
            </Link>
            <Modal
                title={
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <ExclamationCircleOutlined
                            style={{ color: "#ff4d4f", marginRight: 8 }}
                        />
                        <span>Lỗi đăng nhập</span>
                    </div>
                }
                open={errorVisible}
                onCancel={handleErrorClose}
                footer={[
                    <Button key="ok" type="primary" onClick={handleErrorClose}>
                        Đồng ý
                    </Button>,
                ]}
                centered
            >
                <Alert
                    message="Có lỗi xảy ra, vui lòng thử lại!"
                    type="error"
                    showIcon
                />
            </Modal>

            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-md">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">
                            Đăng Nhập
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Chào mừng trở lại! Vui lòng đăng nhập.
                        </p>
                    </div>

                    <Form
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập email đã đăng ký!",
                                },
                                {
                                    type: "email",
                                    message: "Định dạng email không hợp lệ!",
                                },
                            ]}
                        >
                            <Input
                                prefix={
                                    <UserOutlined className="text-gray-400" />
                                }
                                placeholder="Tên đăng nhập"
                                className="h-12 rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập mật khẩu!",
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={
                                    <LockOutlined className="text-gray-400" />
                                }
                                placeholder="Mật khẩu"
                                className="h-12 rounded-lg"
                            />
                        </Form.Item>

                        <div className="flex justify-between items-center mb-6">
                            <Link
                                to="/forgot-password"
                                className="text-blue-600 hover:text-blue-800 transition"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                className="h-12 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                                loading={loading}
                            >
                                Đăng Nhập
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Hoặc tiếp tục với
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Button
                            block
                            onClick={() => loginGoogle()}
                            className="h-12 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 transition flex items-center justify-center bg-white"
                            icon={<GoogleOutlined />}
                        >
                            Đăng nhập bằng Google
                        </Button>

                        <FacebookLogin
                            appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                            autoLoad={false}
                            fields="name,email,picture"
                            // callback={handleFacebookLogin}
                            onSuccess={(res) => {
                                handleFacebookLogin(res);
                            }}
                            render={(renderProps) => (
                                <Button
                                    block
                                    className="h-12 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition flex items-center justify-center bg-white"
                                    onClick={renderProps.onClick}
                                    disabled={renderProps.disabled}
                                    icon={<FacebookOutlined />}
                                >
                                    Đăng nhập bằng Facebook
                                </Button>
                            )}
                        />
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Chưa có tài khoản?{" "}
                            <Link
                                to="/register"
                                className="text-blue-600 hover:text-blue-800 font-semibold transition"
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

export default LoginPage;
