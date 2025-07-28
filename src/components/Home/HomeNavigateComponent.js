import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, getUserInfo } from "../../utils/auth";
import userService from "../../services/userService";
import { message } from "antd";

const HomeNavigateComponent = ({ activeTab, setActiveTab }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = () => {
            const authStatus = isAuthenticated();
            setIsLoggedIn(authStatus);
            if (authStatus) {
                setUserInfo(getUserInfo());
            } else {
                setUserInfo(null);
            }
        };

        checkAuthStatus();
        // Lắng nghe sự thay đổi storage để cập nhật khi user login/logout
        window.addEventListener("storage", checkAuthStatus);

        return () => {
            window.removeEventListener("storage", checkAuthStatus);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await userService.logout();
            message.success("Đăng xuất thành công!");
        } catch (error) {
            console.error("Logout error:", error);
            message.warning(
                "Có lỗi khi đăng xuất, nhưng bạn vẫn được đăng xuất khỏi hệ thống"
            );
        } finally {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setUserInfo(null);
            navigate("/");
            // Trigger storage event để các component khác cập nhật
            window.dispatchEvent(new Event("storage"));
        }
    };

    const handlePredictionClick = () => {
        if (!isLoggedIn) {
            message.warning("Vui lòng đăng nhập để sử dụng tính năng dự đoán!");
            navigate("/login");
        } else {
            setActiveTab("prediction");
        }
    };

    const handleHistoryClick = () => {
        if (!isLoggedIn) {
            message.warning("Vui lòng đăng nhập để xem lịch sử dự đoán!");
            navigate("/login");
        } else {
            setActiveTab("history");
        }
    };

    return (
        <header className="bg-white/95 shadow-lg backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-5">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 mr-4 shadow-lg transform hover:scale-105 transition duration-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                                MammoAI
                            </span>
                            <div className="text-xs text-gray-500 font-medium">
                                Tầm soát ung thư vú
                            </div>
                        </div>
                    </div>

                    {/* Menu ngang - Tất cả items thẳng hàng */}
                    <nav className="hidden md:flex items-center space-x-2">
                        <button
                            onClick={() => setActiveTab("home")}
                            className={`relative font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ${
                                activeTab === "home"
                                    ? "text-blue-700 bg-blue-50 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <span className="flex items-center">
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                    />
                                </svg>
                                Trang chủ
                            </span>
                            {activeTab === "home" && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-blue-500 rounded-full"></div>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab("screening")}
                            className={`relative font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ${
                                activeTab === "screening"
                                    ? "text-blue-700 bg-blue-50 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <span className="flex items-center">
                                <svg
                                    className="w-4 h-4 mr-2"
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
                                Tầm soát
                            </span>
                            {activeTab === "screening" && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-blue-500 rounded-full"></div>
                            )}
                        </button>

                        <button
                            onClick={handlePredictionClick}
                            className={`relative font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ${
                                activeTab === "prediction"
                                    ? "text-blue-700 bg-blue-50 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <span className="flex items-center">
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                                Dự đoán
                                {!isLoggedIn && (
                                    <svg
                                        className="w-3 h-3 ml-1 text-red-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </span>
                            {activeTab === "prediction" && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-blue-500 rounded-full"></div>
                            )}
                        </button>

                        <button
                            onClick={handleHistoryClick}
                            className={`relative font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ${
                                activeTab === "history"
                                    ? "text-blue-700 bg-blue-50 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <span className="flex items-center">
                                <svg
                                    className="w-4 h-4 mr-2"
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
                                Lịch sử dự đoán
                                {!isLoggedIn && (
                                    <svg
                                        className="w-3 h-3 ml-1 text-red-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </span>
                            {activeTab === "history" && (
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-blue-500 rounded-full"></div>
                            )}
                        </button>

                        <div className="h-6 w-px bg-gray-300 mx-2"></div>

                        {/* Hiển thị login/register hoặc user info tùy theo trạng thái */}
                        {!isLoggedIn ? (
                            <>
                                <Link
                                    to="/login"
                                    className="font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center group"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2 group-hover:text-blue-500 transition duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Đăng nhập
                                    <span className="ml-1 text-xs text-gray-400 group-hover:text-blue-400 transition duration-300">
                                        (Bác sĩ)
                                    </span>
                                </Link>

                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                        />
                                    </svg>
                                    Đăng ký
                                    <span className="ml-1 text-xs text-blue-200">
                                        (Bác sĩ)
                                    </span>
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* User info */}
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                                            <svg
                                                className="w-4 h-4 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-800">
                                                {userInfo?.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Bác sĩ
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logout button */}
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 border border-red-200 hover:border-red-300 flex items-center group"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-2 group-hover:text-red-700 transition duration-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                            />
                                        </svg>
                                        Đăng xuất
                                    </button>
                                </div>
                            </>
                        )}
                    </nav>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition duration-300">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HomeNavigateComponent;
