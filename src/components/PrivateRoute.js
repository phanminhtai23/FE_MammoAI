import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { message } from "antd";

const PrivateRoute = ({ children }) => {
    if (!isAuthenticated()) {
        message.warning("Vui lòng đăng nhập để truy cập trang này!");
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
