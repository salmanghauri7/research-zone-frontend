import userApi from "@/api/userApi";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  firstName: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

export const fetchUser = createAsyncThunk(
  "user/login",
  async (
    credentials: { username?: string; email?: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await userApi.login(credentials);
      const { accessToken, user } = response.data.data;
      localStorage.setItem("acessToken", accessToken);
      return user as User;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || "login failed");
    }
  },
);
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchUser.fulfilled,
      (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      },
    );
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
