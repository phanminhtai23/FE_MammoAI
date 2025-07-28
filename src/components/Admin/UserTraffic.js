import React, { useState, useEffect } from "react";
import {
    Users,
    UserCheck,
    TrendingUp,
    BarChart3,
    PieChart,
    Activity,
    Calendar,
    Settings,
} from "lucide-react";
import { Select, Card, Statistic, message, Spin } from "antd";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import trafficService from "../../services/trafficService";

const UserTraffic = () => {
    // State cho dữ liệu thực
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        onlineUsers: 0,
        newUsersThisMonth: 0,
        averageSessions: 0,
    });
    const [newUsersByMonth, setNewUsersByMonth] = useState([]);
    const [authProviderData, setAuthProviderData] = useState([]);
    const [loginsByDay, setLoginsByDay] = useState([]);
    const [loading, setLoading] = useState(false);

    // State cho filters
    const [selectedMonths, setSelectedMonths] = useState(6);
    const [loginDays, setLoginDays] = useState(14); // Thay đổi từ dateRange thành loginDays

    // Fetch thống kê tổng quan
    const fetchTrafficOverview = async () => {
        try {
            const response = await trafficService.getTrafficOverview();
            if (response.data.status_code === 200) {
                console.log("response.data.data: ", response.data.data);
                setStatistics(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching traffic overview:", error);
            message.error("Không thể tải thống kê tổng quan");
        }
    };

    // Fetch user mới theo tháng
    const fetchNewUsersByMonth = async (months = selectedMonths) => {
        try {
            const response = await trafficService.getNewUsersByMonth(months);
            if (response.data.status_code === 200) {
                setNewUsersByMonth(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching new users by month:", error);
            message.error("Không thể tải thống kê user mới");
        }
    };

    // Fetch phân bố auth provider
    const fetchAuthProviderDistribution = async () => {
        try {
            const response = await trafficService.getAuthProviderDistribution();
            if (response.data.status_code === 200) {
                setAuthProviderData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching auth provider distribution:", error);
            message.error("Không thể tải phân bố auth provider");
        }
    };

    // Fetch logins theo số ngày
    const fetchLoginsByDays = async (days = loginDays) => {
        try {
            const response = await trafficService.getLoginsByPeriod(
                "day", // luôn theo ngày
                days
            );
            if (response.data.status_code === 200) {
                setLoginsByDay(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching logins by period:", error);
            message.error("Không thể tải thống kê đăng nhập");
        }
    };

    // Load tất cả dữ liệu khi component mount
    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchTrafficOverview(),
                fetchNewUsersByMonth(),
                fetchAuthProviderDistribution(),
                fetchLoginsByDays(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Effects
    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        fetchNewUsersByMonth(selectedMonths);
    }, [selectedMonths]);

    useEffect(() => {
        fetchLoginsByDays(loginDays);
    }, [loginDays]);

    const getFilteredNewUsers = () => {
        return newUsersByMonth;
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat("vi-VN").format(num);
    };

    return (
        <>
            {/* CSS inline để giảm padding Card */}
            {/* <style>
                {`
                .user-traffic-cards .ant-card .ant-card-body {
                    padding: 8px !important;
                }
                .user-traffic-cards .ant-statistic {
                    margin: 0 !important;
                }
                `}
            </style> */}
            <div className="bg-gradient-to-br from-gray-50 to-white w-full h-screen flex flex-col overflow-hidden">
                {/* Content - Cố định height */}
                <div
                    style={{ height: "calc(100vh - 0px)" }}
                    className="p-2 overflow-hidden flex flex-col"
                >
                    {/* Statistics Cards - Thu nhỏ tối đa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2 user-traffic-cards">
                        <Card className="border-gray-200 shadow-sm">
                            <Statistic
                                title={
                                    <span className="text-gray-600 font-medium text-xs">
                                        Tổng số người dùng
                                    </span>
                                }
                                value={statistics.totalUsers}
                                formatter={(value) => formatNumber(value)}
                                prefix={
                                    <Users
                                        className="text-blue-500"
                                        size={30}
                                    />
                                }
                                valueStyle={{
                                    color: "#374151",
                                    fontSize: "30px",
                                    fontWeight: "bold",
                                }}
                            />
                        </Card>

                        <Card className="border-gray-200 shadow-sm">
                            <Statistic
                                title={
                                    <span className="text-gray-600 font-medium text-xs">
                                        Đang online
                                    </span>
                                }
                                value={statistics.onlineUsers}
                                formatter={(value) => formatNumber(value)}
                                prefix={
                                    <UserCheck
                                        className="text-green-500"
                                        size={30}
                                    />
                                }
                                valueStyle={{
                                    color: "#059669",
                                    fontSize: "30px",
                                    fontWeight: "bold",
                                }}
                            />
                        </Card>

                        <Card className="border-gray-200 shadow-sm">
                            <Statistic
                                title={
                                    <span className="text-gray-600 font-medium text-xs">
                                        Người dùng mới tháng này
                                    </span>
                                }
                                value={statistics.newUsersThisMonth}
                                formatter={(value) => formatNumber(value)}
                                prefix={
                                    <TrendingUp
                                        className="text-blue-600"
                                        size={30}
                                    />
                                }
                                valueStyle={{
                                    color: "#2563EB",
                                    fontSize: "30px",
                                    fontWeight: "bold",
                                }}
                            />
                        </Card>

                        <Card className="border-gray-200 shadow-sm">
                            <Statistic
                                title={
                                    <span className="text-gray-600 font-medium text-xs">
                                        Phiên trung bình
                                    </span>
                                }
                                value={statistics.averageSessions}
                                precision={1}
                                prefix={
                                    <BarChart3
                                        className="text-purple-500"
                                        size={30}
                                    />
                                }
                                valueStyle={{
                                    color: "#7C3AED",
                                    fontSize: "30px",
                                    fontWeight: "bold",
                                }}
                            />
                        </Card>
                    </div>

                    {/* Charts Grid - Layout mới theo yêu cầu */}
                    <Spin spinning={loading}>
                        <div
                            className="grid grid-cols-1 lg:grid-cols-3 gap-2"
                            style={{ height: "calc(100vh - 140px)" }}
                        >
                            {/* Cột trái - Chứa 2 biểu đồ xếp dọc */}
                            <div className="lg:col-span-2 space-y-3 h-full flex flex-col">
                                {/* New Users by Month - Area Chart */}
                                <Card
                                    title={
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-800 font-medium text-xs">
                                                Người dùng mới theo tháng
                                            </span>
                                            <Select
                                                value={selectedMonths}
                                                onChange={setSelectedMonths}
                                                className="w-24"
                                                size="small"
                                                options={[
                                                    {
                                                        value: 3,
                                                        label: "3 Tháng",
                                                    },
                                                    {
                                                        value: 6,
                                                        label: "6 Tháng",
                                                    },
                                                    {
                                                        value: 12,
                                                        label: "12 Tháng",
                                                    },
                                                ]}
                                            />
                                        </div>
                                    }
                                    className="border-gray-200 shadow-sm flex-1"
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height={160}
                                    >
                                        <AreaChart data={getFilteredNewUsers()}>
                                            <defs>
                                                <linearGradient
                                                    id="colorUsers"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="#3B82F6"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="#3B82F6"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#E5E7EB"
                                            />
                                            <XAxis
                                                dataKey="label"
                                                stroke="#6B7280"
                                                fontSize={10}
                                                height={30}
                                            />
                                            <YAxis
                                                stroke="#6B7280"
                                                fontSize={10}
                                                width={35}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "white",
                                                    border: "1px solid #E5E7EB",
                                                    borderRadius: "8px",
                                                    boxShadow:
                                                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="users"
                                                stroke="#3B82F6"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorUsers)"
                                                dot={{
                                                    fill: "#3B82F6",
                                                    strokeWidth: 2,
                                                    r: 4,
                                                }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Card>

                                {/* Login Sessions by Day - Bar Chart */}
                                <Card
                                    title={
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-800 font-medium text-xs">
                                                Lượt đăng nhập gần đây
                                            </span>
                                            <Select
                                                value={loginDays}
                                                onChange={setLoginDays}
                                                size="small"
                                                className="w-26"
                                                options={[
                                                    {
                                                        value: 7,
                                                        label: "7 ngày",
                                                    },
                                                    {
                                                        value: 10,
                                                        label: "10 ngày",
                                                    },
                                                    {
                                                        value: 14,
                                                        label: "14 ngày",
                                                    },
                                                ]}
                                            />
                                        </div>
                                    }
                                    className="border-gray-200 shadow-sm flex-1 min-h-0"
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height={140}
                                    >
                                        <BarChart data={loginsByDay}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#E5E7EB"
                                            />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#6B7280"
                                                fontSize={10}
                                                height={30}
                                            />
                                            <YAxis
                                                stroke="#6B7280"
                                                fontSize={10}
                                                width={35}
                                            />
                                            <Tooltip
                                                formatter={(value) => [
                                                    formatNumber(value),
                                                    "Lượt đăng nhập",
                                                ]}
                                                contentStyle={{
                                                    backgroundColor: "white",
                                                    border: "1px solid #E5E7EB",
                                                    borderRadius: "8px",
                                                    boxShadow:
                                                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                }}
                                            />
                                            <Bar
                                                dataKey="logins"
                                                fill="#2563EB"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            </div>

                            {/* Cột phải - Auth Provider Distribution - Pie Chart với chú thích */}
                            <div className="lg:col-span-1">
                                <Card
                                    title={
                                        <span className="text-gray-800 font-medium text-xs">
                                            Phân bố theo nhà cung cấp
                                        </span>
                                    }
                                    className="border-gray-200 shadow-sm h-full"
                                >
                                    <div className="flex flex-col h-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={320}
                                        >
                                            <RechartsPieChart>
                                                <Pie
                                                    data={authProviderData}
                                                    cx="50%"
                                                    cy="45%"
                                                    labelLine={false}
                                                    label={({ percent }) =>
                                                        `${(
                                                            percent * 100
                                                        ).toFixed(0)}%`
                                                    }
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {authProviderData.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    entry.color
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => [
                                                        formatNumber(value),
                                                        "Người dùng",
                                                    ]}
                                                    contentStyle={{
                                                        backgroundColor:
                                                            "white",
                                                        border: "1px solid #E5E7EB",
                                                        borderRadius: "8px",
                                                        boxShadow:
                                                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                                    }}
                                                />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>

                                        {/* Chú thích màu sắc nằm dưới */}
                                        <div className="mt-2 space-y-1">
                                            {authProviderData.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    item.color,
                                                            }}
                                                        ></div>
                                                        <span className="text-xs text-gray-600">
                                                            {item.name ===
                                                            "Google"
                                                                ? "Gmail"
                                                                : item.name ===
                                                                  "Facebook"
                                                                ? "Facebook"
                                                                : item.name}
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-800 ml-auto">
                                                            {formatNumber(
                                                                item.value
                                                            )}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </Spin>
                </div>
            </div>
        </>
    );
};

export default UserTraffic;
