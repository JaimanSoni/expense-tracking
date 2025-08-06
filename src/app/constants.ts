// const BASE_API_URL = "http://localhost:3000";
const BASE_API_URL = "https://expense-tracking-flax.vercel.app";

export const API_URLS = {
  EXPENSE: {
    CREATE: BASE_API_URL + "/api/expense",
    GET: BASE_API_URL + "/api/expense",
    UPDATE: BASE_API_URL + "/api/expense",
    DELETE: BASE_API_URL + "/api/expense",
    // UPDATE: (id: string) => BASE_API_URL + `/api/expense/${id}`,
    // DELETE: (id: string) => BASE_API_URL + `/api/expense/${id}`,
    // GET_BY_ID: (id: string) => BASE_API_URL + `/api/expense/${id}`,
  },
};

export const CATEGORIES = [
  "Salary",
  "Music",
  "Relative",
  "Extra Work",
  "Freelancing",
  "Trading",
  "Travel",
  "Food",
  "Party",
  "Party with Family",
  "Party with Friends",
  "Productive",
  "Short Trip",
  "Long Trip",
  "Exam",
  "Fees",
  "Miscelleneous",
  "Lunch",
  "Dinner",
];

export const PAYMENT_TYPES = ["debit", "credit"];

export const PAYMENT_MODES = ["UPI", "CASH"];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
