import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// User
export const login = (data: { email: string; password: string }) =>
  API.post("/user/signin", data);

export const signup = (data: { email: string; password: string; username: string }) =>
  API.post("/user/signup", data);

// Members
export const getMembers = () => API.get("/members");
export const createMember = (data: any) => API.post("/members", data);

// Expenses
export const getExpenses = () => API.get("/expenses");
export const createExpense = (data: any) => API.post("/expenses", data);
export const getExpensesSummary = () => API.get("/expenses/summary");

// Teams
export const getTeams = () => API.get("/teams");
export const createTeam = (data: any) => API.post("/teams", data);

// Splits
export const getSplits = () => API.get("/splits");
export const createSplit = (data: any) => API.post("/splits", data);
export const getSplitsSummary = () => API.get("/splits/summary");

export const searchUsers = (query: string) => {
  return axios.get(`${API}/users/search`, {
    params: { query },
  });
};

export default API;
