import axios from "axios";
import { beginGlobalLoading, endGlobalLoading } from "../loading/loaderBridge";

// Concept: axios.create and environment-aware baseURL.
// What it means: one shared HTTP client centralizes configuration.
// Seen in app: calls go to the Spring Boot task-review-service instead of an in-browser mock.
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8080"
});

// Concept: request interceptor.
// What it means: every outgoing request can be modified in one place.
// Seen in app: auth-style headers and loader start before GET/POST requests to Spring Boot.
http.interceptors.request.use((config) => {
  beginGlobalLoading();
  config.headers.set("REMOTE_USER", "beginner.learner");
  config.headers.set("Authorization", "Bearer mock-learning-token");
  config.headers.set("X-App-Host", window.location.host);
  return config;
});

// Concept: response interceptor.
// What it means: every response/error can be handled in one place.
// Seen in app: loader stops whether the request succeeds or fails.
http.interceptors.response.use(
  (response) => {
    endGlobalLoading();
    return response;
  },
  (error: unknown) => {
    endGlobalLoading();
    return Promise.reject(error);
  }
);



