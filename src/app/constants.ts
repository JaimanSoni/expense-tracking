// const BASE_API_URL = "http://localhost:3000";
const BASE_API_URL =
  "https://expense-tracking-4wcqgk4by-jaimansonis-projects.vercel.app";

export const API_URLS = {
  EXPENSE: {
    CREATE: BASE_API_URL + "/api/expense",
    GET: BASE_API_URL + "/api/expense",
    UPDATE: (id: string) => BASE_API_URL + `/api/expense/${id}`,
    DELETE: (id: string) => BASE_API_URL + `/api/expense/${id}`,
    GET_BY_ID: (id: string) => BASE_API_URL + `/api/expense/${id}`,
  },
};
