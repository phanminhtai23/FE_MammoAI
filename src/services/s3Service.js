import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

// Cấu hình AWS SDK
const S3_CONFIG = {
    bucketName: process.env.REACT_APP_S3_BUCKET_NAME,
    region: process.env.REACT_APP_AWS_REGION,
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
};

// Khởi tạo S3 client
const s3 = new AWS.S3({
    accessKeyId: S3_CONFIG.accessKeyId,
    secretAccessKey: S3_CONFIG.secretAccessKey,
    region: S3_CONFIG.region,
});

/**
 * Upload file trực tiếp lên S3 từ frontend
 * @param {File} file - File object từ input
 * @param {Function} onProgress - Callback để track progress
 * @returns {Promise<string>} - URL của file đã upload
 */
export const uploadImageToS3 = async (file, onProgress = null) => {
    try {
        // Validate file
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`File type không được hỗ trợ: ${file.type}`);
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error(
                `File quá lớn: ${(file.size / (1024 * 1024)).toFixed(
                    1
                )}MB. Max: 10MB`
            );
        }

        // Tạo unique filename
        const imageFileExtension = file.name.split(".").pop().toLowerCase();
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const uniqueId = uuidv4().substring(0, 8);
        const originalName = `${timestamp}_${uniqueId}.${imageFileExtension}`;
        const fileName = `mammo-images/${originalName}`;
        // Cấu hình upload parameters
        const uploadParams = {
            Bucket: S3_CONFIG.bucketName,
            Key: fileName,
            Body: file,
            ContentType: file.type,
            ACL: "public-read", // Cho phép public access để lấy URL
            Metadata: {
                "original-filename": file.name,
                "upload-time": new Date().toISOString(),
                "file-size": file.size.toString(),
            },
        };

        console.log("🚀 Bắt đầu upload lên S3:", fileName);

        // Upload với progress tracking
        const upload = s3.upload(uploadParams);

        // Track progress nếu có callback
        if (onProgress) {
            upload.on("httpUploadProgress", (progress) => {
                const percentCompleted = Math.round(
                    (progress.loaded * 100) / progress.total
                );
                onProgress(percentCompleted);
            });
        }

        // Thực hiện upload
        const result = await upload.promise();

        console.log("✅ Upload S3 thành công:", result.Location);

        return {
            success: true,
            url: result.Location,
            key: fileName,
            originalName: originalName,
            size: file.size,
            type: file.type,
        };
    } catch (error) {
        console.error("❌ Lỗi upload S3:", error);
        throw error;
    }
};

/**
 * Xóa file trên S3
 * @param {string} fileKey - S3 key của file cần xóa
 */
export const deleteImageFromS3 = async (fileKey) => {
    try {
        const deleteParams = {
            Bucket: S3_CONFIG.bucketName,
            Key: fileKey,
        };

        await s3.deleteObject(deleteParams).promise();
        console.log("✅ Đã xóa file S3:", fileKey);
        return true;
    } catch (error) {
        console.error("❌ Lỗi xóa file S3:", error);
        return false;
    }
};

/**
 * Upload model file trực tiếp lên S3 từ frontend
 * @param {File} file - File object từ input
 * @param {Function} onProgress - Callback để track progress
 * @returns {Promise<string>} - URL của file đã upload
 */
export const uploadModelToS3 = async (file, onProgress = null) => {
    try {
        // Validate file
        const allowedTypes = [
            "application/octet-stream", // .pt, .joblib, .pickle
            "text/plain", // .txt
            "application/x-python-code", // Một số file .pt có thể có type này
            "", // Một số file có thể có type rỗng
        ];

        // Kiểm tra extension thay vì chỉ dựa vào file.type
        const fileExtension = file.name.split(".").pop().toLowerCase();
        const allowedExtensions = [
            "pt",
            "txt",
        ];

        if (
            !allowedTypes.includes(file.type) &&
            !allowedExtensions.includes(fileExtension)
        ) {
            throw new Error(
                `File type không được hỗ trợ: ${file.type} (${fileExtension})`
            );
        }

        // Validate file size (max 100MB cho model files)
        const maxSize = 500 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            throw new Error(
                `File quá lớn: ${(file.size / (1024 * 1024)).toFixed(
                    1
                )}MB. Max: 500MB`
            );
        }

        // Tạo unique filename
        const modelFileExtension = file.name.split(".").pop().toLowerCase();
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const uniqueId = uuidv4().substring(0, 8);
        const originalName = `${timestamp}_${uniqueId}.${modelFileExtension}`;
        const fileName = `mammo-models/${originalName}`;

        // Cấu hình upload parameters
        const uploadParams = {
            Bucket: S3_CONFIG.bucketName,
            Key: fileName,
            Body: file,
            ContentType: file.type,
            ACL: "public-read", // Cho phép public access để lấy URL
            Metadata: {
                "original-filename": file.name,
                "upload-time": new Date().toISOString(),
                "file-size": file.size.toString(),
                "file-type": "model",
            },
        };

        console.log("🚀 Bắt đầu upload model lên S3:", fileName);

        // Upload với progress tracking
        const upload = s3.upload(uploadParams);

        // Track progress nếu có callback
        if (onProgress) {
            upload.on("httpUploadProgress", (progress) => {
                const percentCompleted = Math.round(
                    (progress.loaded * 100) / progress.total
                );
                onProgress(percentCompleted);
            });
        }

        // Thực hiện upload
        const result = await upload.promise();

        console.log("✅ Upload model S3 thành công:", result.Location);

        return {
            success: true,
            url: result.Location,
            key: fileName,
            originalName: originalName,
            size: file.size,
            type: file.type,
        };

        // return {
        //     success: true,
        //     url: "test",
        //     key: "test",
        //     originalName: "test",
        //     size: 100,
        //     type: "test",
        // }
    } catch (error) {
        console.error("❌ Lỗi upload model S3:", error);
        throw error;
    }
};

/**
 * Xóa model file trên S3
 * @param {string} fileKey - S3 key của model file cần xóa
 */
export const deleteModelFromS3 = async (fileKey) => {
    try {
        const deleteParams = {
            Bucket: S3_CONFIG.bucketName,
            Key: fileKey,
        };

        await s3.deleteObject(deleteParams).promise();
        console.log("✅ Đã xóa model file S3:", fileKey);
        return true;
    } catch (error) {
        console.error("❌ Lỗi xóa model file S3:", error);
        return false;
    }
};
