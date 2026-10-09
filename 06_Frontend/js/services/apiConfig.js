/*
 * Shared API URL for authentication, chat, and calling.
 * Local development works automatically. For HTTPS phone testing or deployment,
 * set API_BASE_URL_OVERRIDE to the public HTTPS backend URL ending in /api.
 */
const API_BASE_URL_OVERRIDE = "";

export const API_BASE_URL = (
  API_BASE_URL_OVERRIDE ||
  window.CORAL_REEF_API_BASE_URL ||
  localStorage.getItem("coral_reef_api_base_url") ||
  `${window.location.protocol}//${window.location.hostname}:8000/api`
).replace(/\/$/, "");
