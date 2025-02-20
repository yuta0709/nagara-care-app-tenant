import Axios, { type AxiosRequestConfig } from "axios";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const token = localStorage.getItem("token");
  const headers = token
    ? {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    : config.headers;

  return AXIOS_INSTANCE({
    ...config,
    headers,
  }).then(({ data }) => data);
};
