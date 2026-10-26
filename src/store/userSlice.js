import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid: "",
  displayName: "",
  email: "",
  // "loading" until Firebase has restored (or ruled out) a session.
  status: "loading",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo: (state, { payload }) => {
      return { ...state, ...payload, status: "authenticated" };
    },
    clearUserInfo: () => {
      return { ...initialState, status: "guest" };
    },
  },
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;
