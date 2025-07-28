import React, { useState } from "react";
import UserManagement from "../components/Admin/UserManagement";
import UserTraffic from "../components/Admin/UserTraffic";
import PredictManagement from "../components/Admin/PredictManagement";
import MammoManagement from "../components/Admin/MammoManagement";
import {
    Users,
    BarChart,
    Search,
    Image,
    Menu,
    ChevronLeft,
    LogOut,
    Moon,
    Sun,
} from "lucide-react";
import { message } from "antd";
import userService from "../services/userService";
import { useNavigate } from "react-router-dom";
import avt_admin from "../assets/avt_admin.png";

const AdminDashboard = ({ avatarUrl, userName }) => {
    const [selectedKey, setSelectedKey] = useState("1");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    // Avatar và tên mặc định nếu không truyền vào
    const displayAvatar = avatarUrl || avt_admin;
    const displayName = userName || "Admin";

    const renderContent = () => {
        switch (selectedKey) {
            case "1":
                return <UserManagement darkMode={darkMode} />;
            case "2":
                return <UserTraffic />;
            case "3":
                return <PredictManagement />;
            case "4":
                return <MammoManagement />;
            default:
                return <UserManagement darkMode={darkMode} />;
        }
    };

    const LogoutLogic = async () => {
        let token = localStorage.getItem("token");
        if (token) {
            try {
                // Gọi API logout để cập nhật user session
                const response = await userService.logout();

                // Xóa token khỏi localStorage
                localStorage.removeItem("token");

                message.success("Đăng xuất thành công!");
                navigate("/login");
            } catch (error) {
                console.log("Logout error:", error);

                // Vẫn xóa token ngay cả khi API lỗi
                localStorage.removeItem("token");

                if (error.response?.status === 401) {
                    message.warning("Phiên đăng nhập đã hết hạn!");
                } else {
                    message.error(
                        "Có lỗi khi đăng xuất, nhưng bạn đã được đăng xuất!"
                    );
                }
                navigate("/login");
            }
        } else {
            message.error("Bạn chưa đăng nhập!");
            navigate("/login");
        }
    };

    // Toggle dark mode (chỉ là ví dụ, anh có thể tích hợp theme thực tế sau)
    const handleToggleDarkMode = () => {
        setDarkMode(!darkMode);
        // Thêm logic đổi theme ở đây nếu muốn
    };

    return (
        <div
            className={`flex min-h-screen ${
                darkMode ? "bg-gray-900" : "bg-[#f6f8fa]"
            }  `}
        >
            {/* Sidebar */}
            <div
                className={`transition-all duration-300 ${
                    sidebarOpen ? "w-60" : "w-16"
                } ${
                    darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                } border-r flex flex-col relative`}
            >
                {/* Logo + Toggle Button */}
                <div
                    className={`h-16 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4`}
                >
                    <span
                        className={`text-lg font-bold transition-all duration-300 ${
                            sidebarOpen
                                ? darkMode
                                    ? "text-white"
                                    : "text-gray-700"
                                : "opacity-0 w-0"
                        }`}
                    >
                        MammoAI
                    </span>
                    <button
                        className={`z-10 border rounded-full shadow p-1 transition-all duration-200
                            ${
                                darkMode
                                    ? "bg-black hover:bg-gray-900 text-white"
                                    : "bg-white hover:bg-gray-200 text-gray-700"
                            } border-gray-200 dark:border-gray-700 flex items-center justify-center`}
                        style={{ width: 36, height: 36 }}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? (
                            <ChevronLeft
                                size={25}
                                className={
                                    darkMode ? "text-white" : "text-gray-700"
                                }
                            />
                        ) : (
                            <Menu
                                size={28}
                                className={
                                    darkMode ? "text-white" : "text-gray-700"
                                }
                            />
                        )}
                    </button>
                </div>
                {/* Avatar + UserName */}
                {sidebarOpen && (
                    <div className="flex flex-col items-center py-6">
                        <img
                            src={displayAvatar}
                            alt="avatar"
                            className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 mb-2"
                        />
                        <span
                            className={`text-base ${
                                darkMode ? "text-white" : "text-gray-800"
                            }`}
                        >
                            {displayName}
                        </span>
                    </div>
                )}
                {/* Menu */}
                <nav className="flex-grow p-2">
                    <ul className="space-y-2">
                        {[
                            {
                                key: "1",
                                icon: Users,
                                label: "Quản Lý Người Dùng",
                            },
                            {
                                key: "2",
                                icon: BarChart,
                                label: "Lưu Lượng Truy Cập",
                            },
                            {
                                key: "3",
                                icon: Search,
                                label: "Quản Lý Dự Đoán",
                            },
                            {
                                key: "4",
                                icon: Image,
                                label: "Quản Lý Ảnh Mammo",
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = selectedKey === item.key;
                            return (
                                <li
                                    key={item.key}
                                    className={`group flex flex-row items-center transition-all duration-200 cursor-pointer rounded-lg
                                        ${
                                            sidebarOpen
                                                ? "p-3"
                                                : "justify-center p-2"
                                        }
                                        ${
                                            isActive
                                                ? darkMode
                                                    ? "bg-gray-700 text-white font-bold"
                                                    : "bg-gray-200 text-black font-bold"
                                                : darkMode
                                                ? "hover:bg-gray-700 hover:text-white text-gray-200"
                                                : "hover:bg-gray-200 hover:text-black text-gray-700"
                                        }
                                    `}
                                    style={
                                        !sidebarOpen
                                            ? { justifyContent: "center" }
                                            : {}
                                    }
                                    onClick={() => setSelectedKey(item.key)}
                                >
                                    <Icon
                                        size={sidebarOpen ? 22 : 28}
                                        className={`transition-all duration-200 mr-3 ${
                                            !sidebarOpen ? "mx-auto" : ""
                                        }`}
                                    />
                                    {sidebarOpen && (
                                        <span className="transition-all duration-200">
                                            {item.label}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                {/* Dark mode toggle */}
                <div
                    className={`px-4 pb-2 ${
                        !sidebarOpen ? "flex items-center justify-center" : ""
                    }`}
                >
                    <button
                        className={`flex items-center w-full p-3 mb-2 rounded-lg transition-all duration-200
                            ${
                                sidebarOpen
                                    ? "hover:bg-gray-200 hover:text-black dark:hover:bg-gray-600 dark:hover:text-white text-gray-700 dark:text-gray-200"
                                    : "justify-center hover:bg-gray-200 hover:text-black dark:hover:bg-gray-600 dark:hover:text-white text-gray-700 dark:text-gray-200"
                            }
                        `}
                        style={
                            !sidebarOpen
                                ? {
                                      justifyContent: "center",
                                      width: "48px",
                                      height: "48px",
                                      margin: "0 auto",
                                  }
                                : {}
                        }
                        onClick={handleToggleDarkMode}
                    >
                        {/* Switch icon */}
                        <span
                            className="flex items-center mr-3"
                            style={{ minWidth: 40 }}
                        >
                            <span
                                className={`relative inline-block w-10 align-middle select-none transition duration-200 ease-in`}
                            >
                                <span
                                    className={`block w-10 h-6 rounded-full transition-colors duration-200 ${
                                        darkMode ? "bg-blue-500" : "bg-gray-300"
                                    }`}
                                ></span>
                                <span
                                    className={`absolute left-0 top-0 w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ${
                                        darkMode
                                            ? "translate-x-4 bg-white"
                                            : "bg-white"
                                    }`}
                                    style={{
                                        border: "1px solid #ccc",
                                        left: darkMode ? "1x" : "0",
                                        transition: "left 0.2s, transform 0.2s",
                                    }}
                                ></span>
                            </span>
                        </span>
                        {sidebarOpen && (
                            <span
                                className={`transition-all duration-200 ${
                                    darkMode ? "text-white" : "text-gray-700"
                                }`}
                            >
                                {darkMode ? "Chế Độ Sáng" : "Chế Độ Tối"}
                            </span>
                        )}
                    </button>
                </div>
                {/* Logout Section */}
                <div
                    className={`p-3 border-t border-gray-200 dark:border-gray-700 ${
                        !sidebarOpen ? "flex items-center justify-center" : ""
                    }`}
                >
                    <button
                        className={`flex items-center w-full p-2 rounded-lg transition-all duration-200
                            ${
                                sidebarOpen
                                    ? "hover:bg-gray-200 hover:text-black dark:hover:bg-gray-600 dark:hover:text-white text-gray-700 dark:text-gray-200"
                                    : "justify-center hover:bg-gray-200 hover:text-black dark:hover:bg-gray-600 dark:hover:text-white text-gray-700 dark:text-gray-200"
                            }
                        `}
                        style={
                            !sidebarOpen
                                ? {
                                      justifyContent: "center",
                                      width: "48px",
                                      height: "30px",
                                      margin: "0 auto",
                                  }
                                : {}
                        }
                        onClick={LogoutLogic}
                    >
                        <LogOut
                            size={sidebarOpen ? 22 : 28}
                            className={`text-red-500 ${
                                !sidebarOpen ? "mx-auto" : "mr-3"
                            }`}
                        />
                        {sidebarOpen && (
                            <span
                                className={`transition-all duration-200 ${
                                    darkMode ? "text-white" : "text-gray-700"
                                }`}
                            >
                                Đăng Xuất
                            </span>
                        )}
                    </button>
                </div>
            </div>
            {/* Main Content Area */}
            <div
                className={`flex-1 ${
                    darkMode ? "bg-gray-900" : "bg-[#f6f8fa]"
                } flex flex-col`}
            >
                <main className="flex-grow">{renderContent()}</main>
            </div>
        </div>
    );
};

export default AdminDashboard;
