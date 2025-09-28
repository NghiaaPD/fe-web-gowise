<script lang="ts">
    import { onMount } from "svelte";
    import AdminBoard from "../../../pages/AdminBoard.svelte";

    // Verify admin authentication and role
    onMount(() => {
        // Kiểm tra accessToken từ cookie
        const cookies = document.cookie.split(";");
        const tokenCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("accessToken="),
        );

        if (!tokenCookie) {
            // Không có token, redirect về trang đăng nhập
            window.location.href = "/";
            return;
        }

        const token = tokenCookie.split("=")[1];

        // Decode token để kiểm tra role
        try {
            const payload = token.split(".")[1];
            const decoded = atob(payload);
            const tokenData = JSON.parse(decoded);
            const userRole = tokenData?.role || tokenData?.user_role || "user";

            // Kiểm tra user có quyền admin không
            if (userRole !== "admin" && userRole !== "administrator") {
                // Không phải admin, redirect về trang user hoặc login
                const userId =
                    tokenData?.user_id || tokenData?.id || tokenData?.sub;
                if (userId) {
                    window.location.href = `/${userId}/mainScreen`;
                } else {
                    window.location.href = "/";
                }
                return;
            }

            // Log successful admin authentication
            console.log(
                `Admin user authenticated successfully with role: ${userRole}`,
            );
        } catch (error) {
            console.error("Error verifying admin token:", error);
            window.location.href = "/";
            return;
        }
    });
</script>

<AdminBoard />
