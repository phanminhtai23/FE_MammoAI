import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import userService from "../../services/userService";
import { message } from "antd";
import { LoadingPage } from "../loading";

let hasShownSuccessMessage = false; // Cờ kiểm soát
let hasShownWarningMessage = false; // Cờ kiểm soát

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifyToken = async () => {   
            const token = localStorage.getItem("token");
            if (!token) {
                setIsAuthenticated(false);
                // setIsAuthenticated(true);
                return;
            }

            try {
                let response = await userService.verifyResetToken({token: token});
                if (response.status !== 200) {
                    setIsAuthenticated(false);
                    return;
                }
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            }
        };

        verifyToken();
    }, []);

    // Hiển thị thông báo khi trạng thái thay đổi
    useEffect(() => {
        if (isAuthenticated === false && !hasShownWarningMessage) {
            message.warning("Vui lòng đăng nhập lại !");
            hasShownWarningMessage = true;
        }

        if (isAuthenticated === true && !hasShownSuccessMessage) {
            message.success("Đăng nhập thành công !");
            hasShownSuccessMessage = true;  
        }
    }, [isAuthenticated]);

    if (isAuthenticated === null) {
        return <LoadingPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;
