import { createSlice } from '@reduxjs/toolkit'

const savedToken = localStorage.getItem('careerly_token')
const savedUser = localStorage.getItem('careerly_user')

const initialState = {
  token: savedToken || null,
  user: savedUser ? JSON.parse(savedUser) : null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      const { token, user } = action.payload
      state.token = token
      state.user = user
      localStorage.setItem('careerly_token', token)
      localStorage.setItem('careerly_user', JSON.stringify(user))
    },
    logout(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('careerly_token')
      localStorage.removeItem('careerly_user')
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('careerly_user', JSON.stringify(state.user))
    },
  },
})

export const { loginSuccess, logout, updateUser } = authSlice.actions
export default authSlice.reducer