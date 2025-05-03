import api from "./api";

interface LoginRequest {
  email: string;
  password: string;
}

interface EmailVerifyRequest {
  email: string;
  code: string;
}

export const login = async (data: LoginRequest) => {
  const response = await api.post("/auth/login", data);

  if (response.data.success) {
    const { email, nickname } = response.data.data;
    const { accessToken, refreshToken } = response.data.data.token;

    localStorage.setItem("email", email);
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }
  
  return response.data;
};


export const emailVerify = async (data: EmailVerifyRequest) => {
  const response = await api.post("/mail/verify", data);

  return response.data;
};