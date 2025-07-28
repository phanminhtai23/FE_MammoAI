import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import {
    GoogleOutlined,
    FacebookOutlined,
    LockOutlined,
    UserOutlined,
    MailOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import userService from "../../services/userService";
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { isAuthenticated, getUserInfo } from "../../utils/auth";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Auto redirect nếu đã đăng nhập
    useEffect(() => {
        if (isAuthenticated()) {
            const userInfo = getUserInfo();
            message.info(
                `Bạn đã đăng nhập rồi, ${userInfo?.name || userInfo?.email}!`
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
    const registerGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const response = await userService.googleRegister({
                    token: tokenResponse.access_token,
                });
                console.log("response:", response);
                message.success("Đăng ký thành công!");
                navigate("/login");
            } catch (error) {
                console.log("error:", error);
                // Xử lý các loại lỗi và hiển thị popup
                // sai tài khoản hoặc mật khẩu
                if (!error.response && error.message) {
                    // lỗi kết nối
                    message.error(error.message, 2);
                } else if (error.response) {
                    message.error(error.response.data.detail, 2); // sai tài khoản hoặc mật khẩu hay bị khóa tài khoản
                } else if (error.request) {
                    // lỗi kết nối
                    message.error("Lỗi kết nối đến máy chủ", 2);
                } else {
                    // lỗi kết nối
                    message.error("Đăng ký thất bại", 2);
                }
            }
        },
        onError: () => {
            message.error("Google register thất bại", 2);
        },
    });

    // Handle Facebook login
    const handleFacebookRegister = async (res) => {
        try {
            // console.log("accessToken:", res);
            const response = await userService.facebookRegister({
                token: res.accessToken,
            });
            console.log("response:", response);
            message.success("Đăng ký thành công!");
            navigate("/login");
        } catch (error) {
            console.log("error:", error);
            // Xử lý các loại lỗi và hiển thị popup
            // sai tài khoản hoặc mật khẩu
            if (!error.response && error.message) {
                // lỗi kết nối
                message.error(error.message, 2);
            } else if (error.response) {
                message.error(error.response.data.detail, 2); // sai tài khoản hoặc mật khẩu hay bị khóa tài khoản
            } else if (error.request) {
                // lỗi kết nối
                message.error("Lỗi kết nối đến máy chủ", 2);
            } else {
                // lỗi kết nối
                message.error("Đăng ký thất bại", 2);
            }
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            // Gọi API đăng ký sử dụng userService
            await userService.register({
                name: values.name,
                email: values.email,
                password: values.password,
            });

            // Chỉ khi register thành công mới gửi verification code
            await userService.sendVerificationCode({ email: values.email });

            message.success("Đăng ký thành công!");
            // Navigate to verify page
            navigate("/verify-code", {
                state: { email: values.email, message: "Xác nhận Email" },
            });
            // Chuyển hướng đến trang dashboard
            // navigate("/login");
        } catch (error) {
            console.log("Full error:", error); // Debug

            // Xử lý error message đúng cách
            let errorMessage = "Đăng ký thất bại";

            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;

                // Nếu detail là array (validation errors)
                if (Array.isArray(detail)) {
                    // Lấy message từ error đầu tiên
                    errorMessage = detail[0]?.msg || "Dữ liệu không hợp lệ";
                }
                // Nếu detail là string
                else if (typeof detail === "string") {
                    errorMessage = detail;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage, 2);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center px-4 relative">
            {/* Nút quay về trang chủ */}
            <Link
                to="/"
                className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-green-50 group"
            >
                <ArrowLeftOutlined className="text-green-600 text-lg group-hover:text-green-800" />
            </Link>
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-md">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">
                            Đăng Ký Tài Khoản
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Tạo tài khoản mới để bắt đầu sử dụng
                        </p>
                    </div>

                    <Form
                        name="register"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                    >
                        <Form.Item
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập họ và tên!",
                                },
                            ]}
                        >
                            <Input
                                prefix={
                                    <UserOutlined className="text-gray-400" />
                                }
                                placeholder="Họ và tên"
                                className="h-12 rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập email!",
                                },
                                {
                                    type: "email",
                                    message: "Định dạng email không hợp lệ!",
                                },
                            ]}
                        >
                            <Input
                                prefix={
                                    <MailOutlined className="text-gray-400" />
                                }
                                placeholder="Địa chỉ email"
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
                                {
                                    min: 6,
                                    message: "Mật khẩu phải có ít nhất 6 ký tự",
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

                        <Form.Item
                            name="confirmPassword"
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
                                            new Error(
                                                "Mật khẩu xác nhận không khớp!"
                                            )
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={
                                    <LockOutlined className="text-gray-400" />
                                }
                                placeholder="Xác nhận mật khẩu"
                                className="h-12 rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                className="h-12 rounded-lg bg-green-600 hover:bg-green-700 transition"
                                loading={loading}
                            >
                                Đăng Ký
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Hoặc đăng ký với
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Button
                            block
                            onClick={() => registerGoogle()}
                            className="h-12 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 transition flex items-center justify-center bg-white"
                            icon={<GoogleOutlined />}
                        >
                            Đăng ký bằng Google
                        </Button>

                        <FacebookLogin
                            appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                            autoLoad={false}
                            fields="name,email,picture"
                            // callback={handleFacebookRegister}
                            onSuccess={(res) => {
                                handleFacebookRegister(res);
                            }}
                            render={(renderProps) => (
                                <Button
                                    block
                                    className="h-12 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition flex items-center justify-center bg-white"
                                    onClick={renderProps.onClick}
                                    disabled={renderProps.disabled}
                                    icon={<FacebookOutlined />}
                                >
                                    Đăng ký bằng Facebook
                                </Button>
                            )}
                        />
                    </div>
                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Đã có tài khoản?{" "}
                            <Link
                                to="/login"
                                className="text-green-600 hover:text-green-800 font-semibold transition"
                            >
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
