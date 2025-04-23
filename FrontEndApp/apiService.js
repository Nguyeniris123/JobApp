import API_ENDPOINTS from "./apiConfig";

const getAuthHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // Gán Access Token vào Header
});

export const loginUser = async (email, password) => {
    try {
        const jsonData = {
            client_id: "OidP3ERxQtbZvrMN31JhxjjTWm325MLA3OMTCH5h",
            client_secret: "UI7wNEiXd6H22GYDOyJU8YcaKNDnhpsBB1Z0Ziq89iGtD1qYzybcLS7AUuNKHV02dlABUVccNxKPLNsOYdAYJLspRffloiTaHG0qVh67JP32zynznskB1fYrmP7jGwon",
            username: email, // Truyền email trực tiếp
            password: password, // Truyền password trực tiếp
            grant_type: "password"
        };

        const response = await axios.post(`${API_ENDPOINTS.TOKEN}`, jsonData, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        return response.data; // Trả về dữ liệu nhận được từ server
    } catch (error) {
        console.error("Lỗi đăng nhập:", error.response?.data || error.message);
        return null; // Trả về null nếu có lỗi
    }
};

export const getCandidateUser  = async(token) => {
    try{
        const response = await fetch(API_ENDPOINTS.GETCANDIDATEUSER, {
            method: "GET",
            headers: getAuthHeaders(token),
        });
        return await response;
    } catch(error) {
        console.log(" Lỗi khi tải user: ", error)
        logout();
    }
}

export const getRecruiterUser  = async(token) => {
    try{
        const response = await fetch(API_ENDPOINTS.GETRECRUITERUSER, {
            method: "GET",
            headers: getAuthHeaders(token),
        });
        return await response;
    } catch(error) {
        console.log(" Lỗi khi tải user: ", error)
        logout();
    }
}


export const fetchJobs = async (token) => {
    try {
        const response = await fetch(API_ENDPOINTS.JOB_POSTS, {
            method: "GET",
            headers: getAuthHeaders(token), // Truyền token vào Header
        });

        return await response.json();
    } catch (error) {
        console.error("Lỗi tải danh sách việc làm:", error);
    }
};