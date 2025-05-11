import axios from "axios";

const api = axios.create({
  baseURL: "http://52.79.149.27/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const { data } = await api.post("/auth/refresh", { "refreshToken": refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;