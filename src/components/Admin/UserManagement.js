import React, { useState, useEffect } from "react";
import {
    Edit,
    Trash2,
    Eye,
    Search as SearchIcon,
    Users,
    Settings,
} from "lucide-react";
import {
    Modal,
    Select,
    Switch,
    Input,
    Button,
    Pagination,
    message,
    Spin,
} from "antd";
import dayjs from "dayjs";
import userService from "../../services/userService";

const PAGE_SIZE = 8;

const UserManagement = ({ darkMode = false }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [filters, setFilters] = useState({
        role: null,
        auth_provider: null,
        is_revoked: null,
    });

    // Fetch users từ API
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                page_size: PAGE_SIZE,
                ...(search && { search }),
                ...(filters.role && { role: filters.role }),
                ...(filters.auth_provider && {
                    auth_provider: filters.auth_provider,
                }),
                ...(filters.is_revoked !== null && {
                    is_revoked: filters.is_revoked,
                }),
            };

            const response = await userService.getUsersAdmin(params);

            if (response.data.status_code === 200) {
                setUsers(response.data.data.users);
                setTotalUsers(response.data.data.pagination.total_users);
            } else {
                message.error("Lỗi khi tải danh sách user");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            message.error(
                "Không thể tải danh sách user: " +
                    (error.response?.data?.detail || error.message)
            );
        } finally {
            setLoading(false);
        }
    };

    // Effect để fetch users khi component mount hoặc params thay đổi
    useEffect(() => {
        fetchUsers();
    }, [currentPage, search, filters]);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1); // Reset về trang 1 khi search
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
        setCurrentPage(1); // Reset về trang 1 khi filter
    };

    const handleEdit = async (user) => {
        try {
            // Fetch chi tiết user trước khi edit
            const response = await userService.getUserDetailAdmin(user.id);
            if (response.data.status_code === 200) {
                setSelectedUser({ ...response.data.data });
                setIsEditModalOpen(true);
            }
        } catch (error) {
            message.error("Không thể lấy thông tin user");
        }
    };

    const handleDetail = async (user) => {
        try {
            const response = await userService.getUserDetailAdmin(user.id);
            if (response.data.status_code === 200) {
                setSelectedUser(response.data.data);
                setIsDetailModalOpen(true);
            }
        } catch (error) {
            message.error("Không thể lấy thông tin user");
        }
    };

    const handleDelete = async (userId) => {
        Modal.confirm({
            title: "Xác nhận xóa user",
            content: "Bạn có chắc chắn muốn xóa user này không?",
            okText: "Xóa",
            cancelText: "Hủy",
            okType: "danger",
            onOk: async () => {
                try {
                    const response = await userService.deleteUserAdmin(userId);
                    if (response.data.status_code === 200) {
                        message.success("Xóa user thành công");
                        fetchUsers(); // Refresh danh sách
                    }
                } catch (error) {
                    message.error(
                        "Không thể xóa user: " +
                            (error.response?.data?.detail || error.message)
                    );
                }
            },
        });
    };

    const handleEditSave = async () => {
        try {
            const updateData = {
                name: selectedUser.name,
                role: selectedUser.role,
                isRevoked: selectedUser.isRevoked,
                confirmed: selectedUser.confirmed,
            };

            const response = await userService.updateUserAdmin(
                selectedUser.id,
                updateData
            );
            if (response.data.status_code === 200) {
                message.success("Cập nhật user thành công");
                setIsEditModalOpen(false);
                fetchUsers(); // Refresh danh sách
            }
        } catch (error) {
            message.error(
                "Không thể cập nhật user: " +
                    (error.response?.data?.detail || error.message)
            );
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div
            className={`bg-gradient-to-br shadow-xl w-full h-screen flex flex-col overflow-hidden ${
                darkMode ? "from-gray-900 to-gray-800" : "from-gray-50 to-white"
            }`}
        >
            {/* Header */}
            <div
                className={`px-4 py-3 shadow-sm flex-shrink-0 ${
                    darkMode ? "bg-gray-800" : "bg-white"
                }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-lg ${
                                darkMode ? "bg-gray-700" : "bg-gray-200"
                            }`}
                        >
                            <Settings
                                size={24}
                                className={
                                    darkMode ? "text-gray-300" : "text-gray-600"
                                }
                            />
                        </div>
                        <div
                            className={`font-bold text-xl ${
                                darkMode ? "text-white" : "text-gray-800"
                            }`}
                        >
                            Admin Dashboard
                        </div>
                    </div>
                    <div
                        className={`px-4 py-2 rounded-full border ${
                            darkMode
                                ? "bg-gray-700 border-gray-600"
                                : "bg-gray-200 border-gray-200"
                        }`}
                    >
                        <span
                            className={`font-medium ${
                                darkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                        >
                            Quản lý người dùng
                        </span>
                    </div>
                </div>
            </div>

            {/* Thanh tìm kiếm và filter */}
            <div
                className={`px-4 py-3 border-b flex-shrink-0 ${
                    darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-100"
                }`}
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="relative flex-1 max-w-md">
                        <div
                            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                                darkMode ? "text-gray-400" : "text-gray-400"
                            }`}
                        >
                            <SearchIcon size={20} />
                        </div>
                        <Input
                            placeholder="Tìm kiếm theo tên hoặc ID người dùng..."
                            value={search}
                            onChange={handleSearch}
                            className={`pl-10 pr-4 py-3 rounded-xl border-0 focus:shadow-md focus:ring-2 transition-all duration-200 ${
                                darkMode
                                    ? "bg-gray-700 hover:bg-gray-600 border-gray-600 focus:ring-blue-400 text-white placeholder-gray-400"
                                    : "bg-gray-50 hover:bg-gray-100 border-gray-200 focus:ring-blue-200"
                            }`}
                            style={{ fontSize: "14px" }}
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-6">
                        <div
                            className={`text-sm ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            Tổng số:{" "}
                            <span
                                className={`font-semibold ${
                                    darkMode ? "text-gray-200" : "text-gray-700"
                                }`}
                            >
                                {totalUsers}
                            </span>{" "}
                            người dùng
                        </div>
                        <div
                            className={`h-6 w-px ${
                                darkMode ? "bg-gray-600" : "bg-gray-300"
                            }`}
                        ></div>
                        <div
                            className={`text-sm ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            Trang:{" "}
                            <span
                                className={`font-semibold ${
                                    darkMode ? "text-gray-200" : "text-gray-700"
                                }`}
                            >
                                {currentPage}
                            </span>
                            /{Math.ceil(totalUsers / PAGE_SIZE)}
                        </div>
                    </div>
                </div>

                {/* Filter row */}
                <div className="flex items-center gap-4">
                    <Select
                        placeholder="Lọc theo role"
                        allowClear
                        style={{ width: 150 }}
                        value={filters.role}
                        onChange={(value) =>
                            handleFilterChange(
                                "role",
                                value === undefined ? null : value
                            )
                        }
                        options={[
                            { value: "admin", label: "Admin" },
                            { value: "user", label: "User" },
                        ]}
                    />
                    <Select
                        placeholder="Lọc theo provider"
                        allowClear
                        style={{ width: 150 }}
                        value={filters.auth_provider}
                        onChange={(value) =>
                            handleFilterChange(
                                "auth_provider",
                                value === undefined ? null : value
                            )
                        }
                        options={[
                            { value: "local", label: "Local" },
                            { value: "google", label: "Google" },
                            { value: "facebook", label: "Facebook" },
                        ]}
                    />
                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        style={{ width: 150 }}
                        value={filters.is_revoked}
                        onChange={(value) =>
                            handleFilterChange(
                                "is_revoked",
                                value === undefined ? null : value
                            )
                        }
                        options={[
                            { value: false, label: "Hoạt động" },
                            { value: true, label: "Bị khóa" },
                        ]}
                    />
                </div>
            </div>

            {/* Container nội dung chính - position: relative */}
            <div style={{ position: "relative", flex: 1, width: "100%" }}>
                {/* Bảng user với loading - CỐ ĐỊNH CHIỀU CAO */}
                <div
                    style={{
                        height: "calc(100vh - 220px)",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        overflow: "auto",
                    }}
                    className={`border shadow-sm overflow-hidden ${
                        darkMode
                            ? "border-gray-700 bg-gray-900"
                            : "border-gray-200 bg-white"
                    }`}
                >
                    <Spin spinning={loading}>
                        <table
                            className={`w-full table-fixed ${
                                darkMode ? "bg-gray-900" : "bg-white"
                            }`}
                        >
                            <thead
                                className={`sticky top-0 z-10 ${
                                    darkMode
                                        ? "bg-gradient-to-r from-gray-800 to-gray-700"
                                        : "bg-gradient-to-r from-gray-50 to-gray-100"
                                }`}
                            >
                                <tr
                                    className={`border-b ${
                                        darkMode
                                            ? "border-gray-700"
                                            : "border-gray-200"
                                    }`}
                                >
                                    <th
                                        className={`py-3 px-4 text-center font-semibold text-sm uppercase tracking-wider w-12 ${
                                            darkMode
                                                ? "text-gray-200"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        STT
                                    </th>
                                    <th
                                        className={`py-3 px-4 text-left font-semibold text-sm uppercase tracking-wider w-40 ${
                                            darkMode
                                                ? "text-gray-200"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        Tên người dùng
                                    </th>
                                    <th
                                        className={`py-3 px-4 text-left font-semibold text-sm uppercase tracking-wider w-24 ${
                                            darkMode
                                                ? "text-gray-200"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        Provider
                                    </th>
                                    <th
                                        className={`py-3 px-4 text-left font-semibold text-sm uppercase tracking-wider w-20 ${
                                            darkMode
                                                ? "text-gray-200"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        Role
                                    </th>
                                    <th
                                        className={`py-3 px-4 text-left font-semibold text-sm uppercase tracking-wider w-32 ${
                                            darkMode
                                                ? "text-gray-200"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        Ngày tạo
                                    </th>
                                    <th
                                        className={`py-3 px-4 text-center font-semibold text-sm uppercase tracking-wider w-32 ${
                                            darkMode
                                                ? "text-gray-200"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody
                                className={`divide-y ${
                                    darkMode
                                        ? "divide-gray-700"
                                        : "divide-gray-100"
                                }`}
                            >
                                {users.map((user, index) => (
                                    <tr
                                        key={user.id}
                                        className={`transition-all duration-200 ${
                                            darkMode
                                                ? index % 2 === 0
                                                    ? "bg-gray-900 hover:bg-gray-800"
                                                    : "bg-gray-800 hover:bg-gray-700"
                                                : index % 2 === 0
                                                ? "bg-white hover:bg-blue-50/50"
                                                : "bg-gray-50/30 hover:bg-blue-50/50"
                                        }`}
                                    >
                                        <td
                                            className={`py-3 px-4 truncate text-center font-medium ${
                                                darkMode
                                                    ? "text-gray-200"
                                                    : "text-gray-800"
                                            }`}
                                        >
                                            {(currentPage - 1) * PAGE_SIZE +
                                                index +
                                                1}
                                        </td>
                                        <td
                                            className={`py-4 px-6 truncate ${
                                                darkMode
                                                    ? "text-gray-200"
                                                    : "text-gray-800"
                                            }`}
                                        >
                                            {user.name}
                                        </td>
                                        <td
                                            className={`py-4 px-6 truncate ${
                                                darkMode
                                                    ? "text-gray-300"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    user.auth_provider ===
                                                    "google"
                                                        ? darkMode
                                                            ? "bg-red-900 text-red-200"
                                                            : "bg-red-100 text-red-800"
                                                        : user.auth_provider ===
                                                          "facebook"
                                                        ? darkMode
                                                            ? "bg-blue-900 text-blue-200"
                                                            : "bg-blue-100 text-blue-800"
                                                        : darkMode
                                                        ? "bg-gray-700 text-gray-200"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {user.auth_provider}
                                            </span>
                                        </td>
                                        <td
                                            className={`py-4 px-6 truncate ${
                                                darkMode
                                                    ? "text-gray-200"
                                                    : "text-gray-800"
                                            }`}
                                        >
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    user.role === "admin"
                                                        ? darkMode
                                                            ? "bg-purple-900 text-purple-200"
                                                            : "bg-purple-100 text-purple-800"
                                                        : darkMode
                                                        ? "bg-green-900 text-green-200"
                                                        : "bg-green-100 text-green-800"
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td
                                            className={`py-4 px-6 truncate text-sm ${
                                                darkMode
                                                    ? "text-gray-300"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {dayjs(user.created_at).format(
                                                "DD/MM/YYYY HH:mm"
                                            )}
                                        </td>
                                        <td className="py-4 px-6 flex items-center justify-center gap-2">
                                            <Button
                                                icon={<Eye size={18} />}
                                                className="!bg-blue-100 !text-blue-700 hover:!bg-blue-200 !border-0 !shadow-sm hover:!shadow-md transition-all"
                                                onClick={() =>
                                                    handleDetail(user)
                                                }
                                                size="small"
                                            />
                                            <Button
                                                icon={<Edit size={18} />}
                                                className="!bg-amber-100 !text-amber-700 hover:!bg-amber-200 !border-0 !shadow-sm hover:!shadow-md transition-all"
                                                onClick={() => handleEdit(user)}
                                                size="small"
                                            />
                                            <Button
                                                icon={<Trash2 size={18} />}
                                                className="!bg-red-100 !text-red-700 hover:!bg-red-200 !border-0 !shadow-sm hover:!shadow-md transition-all"
                                                onClick={() =>
                                                    handleDelete(user.id)
                                                }
                                                size="small"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Spin>
                </div>

                {/* Pagination CỐ ĐỊNH Ở DƯỚI CÙNG - CHỈ TRONG PHẦN NỘI DUNG */}
                <div
                    className={`flex justify-between items-center px-4 py-3 border-t ${
                        darkMode
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-50/50 border-gray-200"
                    }`}
                    style={{
                        background: darkMode ? "#1f2937" : "#f9fafb",
                        minHeight: "60px",
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                    }}
                >
                    <div
                        className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                    >
                        Hiển thị{" "}
                        <span
                            className={`font-medium ${
                                darkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                        >
                            {(currentPage - 1) * PAGE_SIZE + 1}
                        </span>{" "}
                        đến{" "}
                        <span
                            className={`font-medium ${
                                darkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                        >
                            {Math.min(currentPage * PAGE_SIZE, totalUsers)}
                        </span>{" "}
                        của{" "}
                        <span
                            className={`font-medium ${
                                darkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                        >
                            {totalUsers}
                        </span>{" "}
                        kết quả
                    </div>
                    <Pagination
                        current={currentPage}
                        pageSize={PAGE_SIZE}
                        total={totalUsers}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                        className="[&_.ant-pagination-item]:border-gray-300 [&_.ant-pagination-item:hover]:border-gray-400 [&_.ant-pagination-item:hover]:bg-gray-200 [&_.ant-pagination-item:hover]:text-black [&_.ant-pagination-item-active]:bg-gray-400 [&_.ant-pagination-item-active]:border-gray-400 [&_.ant-pagination-item-active>a]:text-black [&_.ant-pagination-prev:hover]:border-gray-400 [&_.ant-pagination-next:hover]:border-gray-400 [&_.ant-pagination-item-active>a]:text-black"
                    />
                </div>
            </div>

            {/* Modal xem chi tiết - same as before */}
            <Modal
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={null}
                title="Chi tiết người dùng"
                bodyStyle={{ paddingLeft: 16, paddingRight: 16 }}
            >
                {selectedUser && (
                    <div className="space-y-2 px-4">
                        <div className="flex justify-center mb-2">
                            <img
                                src={
                                    selectedUser.imgUrl ||
                                    "https://ui-avatars.com/api/?name=" +
                                        encodeURIComponent(selectedUser.name)
                                }
                                alt="avatar"
                                className="w-20 h-20 rounded-full object-cover border-2 border-blue-400"
                            />
                        </div>
                        <div>
                            <b>ID:</b> {selectedUser.id}
                        </div>
                        <div>
                            <b>Tên:</b> {selectedUser.name}
                        </div>
                        <div>
                            <b>Email:</b> {selectedUser.email}
                        </div>
                        <div>
                            <b>Provider:</b> {selectedUser.auth_provider}
                        </div>
                        <div>
                            <b>Role:</b> {selectedUser.role}
                        </div>
                        <div>
                            <b>isRevoked:</b>{" "}
                            {selectedUser.isRevoked ? "True" : "False"}
                        </div>
                        <div>
                            <b>Confirmed:</b>{" "}
                            {selectedUser.confirmed ? "True" : "False"}
                        </div>
                        <div>
                            <b>Ngày tạo:</b>{" "}
                            {dayjs(selectedUser.created_at).format(
                                "DD/MM/YYYY HH:mm"
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal chỉnh sửa - same as before */}
            <Modal
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={handleEditSave}
                title="Chỉnh sửa người dùng"
                okText="Lưu"
                cancelText="Hủy"
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-600 mb-1">
                                Tên người dùng
                            </label>
                            <Input
                                value={selectedUser.name}
                                onChange={(e) =>
                                    setSelectedUser((u) => ({
                                        ...u,
                                        name: e.target.value,
                                    }))
                                }
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">
                                Role
                            </label>
                            <Select
                                value={selectedUser.role}
                                onChange={(v) =>
                                    setSelectedUser((u) => ({ ...u, role: v }))
                                }
                                className="w-full"
                                options={[
                                    { value: "user", label: "User" },
                                    { value: "admin", label: "Admin" },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">
                                isRevoked
                            </label>
                            <Switch
                                checked={selectedUser.isRevoked}
                                onChange={(v) =>
                                    setSelectedUser((u) => ({
                                        ...u,
                                        isRevoked: v,
                                    }))
                                }
                                checkedChildren="True"
                                unCheckedChildren="False"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">
                                Confirmed
                            </label>
                            <Switch
                                checked={selectedUser.confirmed}
                                onChange={(v) =>
                                    setSelectedUser((u) => ({
                                        ...u,
                                        confirmed: v,
                                    }))
                                }
                                checkedChildren="True"
                                unCheckedChildren="False"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;
