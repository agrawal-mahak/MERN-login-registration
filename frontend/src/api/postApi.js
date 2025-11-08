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

export const fetchPosts = async (token) => {
  const response = await axios.get("/api/posts", withAuth(token));
  return response.data;
};

export const fetchMyPosts = async (token) => {
  if (!token) {
    throw new Error("Missing token");
  }
  const response = await axios.get("/api/posts/my/posts", withAuth(token));
  return response.data;
};

export const createPost = async (formData, token) => {
  if (!token) {
    throw new Error("Missing token");
  }
  const response = await axios.post(
    "/api/posts",
    formData,
    withAuth(token)
  );
  return response.data;
};

export const updatePost = async (postId, formData, token) => {
  if (!token) {
    throw new Error("Missing token");
  }
  const response = await axios.put(
    `/api/posts/${postId}`,
    formData,
    withAuth(token)
  );
  return response.data;
};

export const deletePost = async (postId, token) => {
  if (!token) {
    throw new Error("Missing token");
  }
  await axios.delete(`/api/posts/${postId}`, withAuth(token));
};

export const toggleLike = async (postId, token) => {
  if (!token) {
    throw new Error("Missing token");
  }
  const response = await axios.post(
    `/api/posts/${postId}/like`,
    {},
    withAuth(token)
  );
  return response.data;
};

export const addComment = async (postId, payload, token) => {
  if (!token) {
    throw new Error("Missing token");
  }
  const response = await axios.post(
    `/api/posts/${postId}/comments`,
    payload,
    withAuth(token)
  );
  return response.data;
};


