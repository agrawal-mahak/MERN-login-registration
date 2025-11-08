import axios from "axios";

const withAuth = (token, config = {}) => {
  if (!token) return config;

  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
};

export const registerUser = async (payload) => {
  const response = await axios.post("/api/users/register", payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await axios.post("/api/users/login", payload);
  return response.data;
};

export const getCurrentUser = async (token) => {
  if (!token) {
    throw new Error("Missing token");
  }
  const response = await axios.get("/api/users/me", withAuth(token));
  return response.data;
};

export const updateCurrentUser = async (formData, token) => {
  if (!token) {
    throw new Error("Missing token");
  }
  const response = await axios.put(
    "/api/users/me",
    formData,
    withAuth(token)
  );
  return response.data;
};


