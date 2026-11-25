import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { updateUser } from '../features/auth/authSlice'
import { getErrorMessage } from '../utils/response'

export default function Settings() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const [form, setForm] = useState({ name: '', email: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({ name: user?.name || '', email: user?.email || '' })
  }, [user])

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    try {
      // This assumes the backend exposes PUT /users/profile.
      const response = await api.put('/users/profile', form)
      const updatedUser = response.data?.user || response.data?.data || response.data
      dispatch(updateUser(updatedUser))
      toast.success('Profile updated.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Could not update profile. Check that PUT /users/profile exists in your backend.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900">Account settings</h2><p className="mt-1 text-sm text-slate-500">Update the profile information associated with your account.</p></div>
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div><label className="label" htmlFor="name">Full name</label><input className="input" id="name" name="name" value={form.name} onChange={handleChange} required /></div>
        <div><label className="label" htmlFor="email">Email address</label><input className="input" id="email" name="email" type="email" value={form.email} onChange={handleChange} required /></div>
        <div className="border-t border-slate-100 pt-5"><button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button></div>
      </form>
      <p className="text-xs leading-5 text-slate-400">Profile updates require a matching authenticated backend endpoint. The frontend does not change your password here.</p>
    </div>
  )
}