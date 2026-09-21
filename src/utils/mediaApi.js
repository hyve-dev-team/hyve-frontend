import config from "../config";

/**
 * Upload multiple media files to the backend Cloudinary media service.
 * API Endpoint: POST /api/v1/media/upload-multiple
 * 
 * Falls back to single file upload if multiple files batch fails.
 */
export async function uploadMediaFiles(files, folder = "properties") {
    if (!files || files.length === 0) return [];

    const token = localStorage.getItem("token");
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file);
    });
    formData.append("folder", folder);

    let lastErrorMessage = '';

    try {
        const response = await fetch(`${config.baseURL}/api/v1/media/upload-multiple`, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            if (data?.success && Array.isArray(data.data)) {
                return data.data.map((item) => item.url).filter(Boolean);
            }
        } else {
            const errData = await response.json().catch(() => null);
            lastErrorMessage = errData?.message || `Server responded with status ${response.status}`;
        }
    } catch (err) {
        console.warn("Multiple media upload failed, attempting single file uploads:", err);
        lastErrorMessage = err?.message;
    }

    // Fallback: upload one by one
    const uploadedUrls = [];
    for (const file of files) {
        try {
            const singleFormData = new FormData();
            singleFormData.append("file", file);
            singleFormData.append("folder", folder);

            const res = await fetch(`${config.baseURL}/api/v1/media/upload`, {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: singleFormData,
            });

            if (res.ok) {
                const result = await res.json();
                if (result?.success && result?.data?.url) {
                    uploadedUrls.push(result.data.url);
                }
            } else {
                const errData = await res.json().catch(() => null);
                lastErrorMessage = errData?.message || `Failed to upload image ${file.name}`;
            }
        } catch (singleErr) {
            console.error("Single file upload error:", singleErr);
            lastErrorMessage = singleErr?.message;
        }
    }

    if (uploadedUrls.length === 0 && files.length > 0) {
        throw new Error(lastErrorMessage || "Failed to upload property images. Please check your network connection.");
    }

    return uploadedUrls;
}
