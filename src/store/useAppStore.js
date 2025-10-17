import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useApi } from '@/lib/useApi'

export const useAppStore = create(
  devtools((set, get) => {
    const api = useApi()

    return {
      // --- Global State ---
      roles: [],
      documents: [],
      users: [],
      loading: false,
      error: null,

      // --- Actions ---
      setLoading: (val) => set({ loading: val }),
      setError: (err) => set({ error: err }),

      // ✅ Fetch all roles
      fetchRoles: async () => {
        const { setLoading, setError } = get()
        setLoading(true)
        setError(null)
        try {
          const res = await api.getRoles()
          if (res?.roles) set({ roles: res.roles })
        } catch (err) {
          console.error('❌ Failed to fetch roles:', err)
          setError(err)
        } finally {
          setLoading(false)
        }
      },

      // ✅ Fetch all admin documents
      fetchDocuments: async () => {
        const { setLoading, setError } = get()
        setLoading(true)
        setError(null)
        try {
          const res = await api.getAdminDocuments()
          if (res?.data) set({ documents: res.data })
        } catch (err) {
          console.error('❌ Failed to fetch documents:', err)
          setError(err)
        } finally {
          setLoading(false)
        }
      },

      // ✅ Upload document for role and refresh list
      uploadDocumentForRole: async (role, folder, formData) => {
        const { fetchDocuments, setLoading, setError } = get()
        setLoading(true)
        try {
          const res = await api.uploadDocumentForRole(role, folder, formData)
          if (res?.success) {
            await fetchDocuments()
          }
          return res
        } catch (err) {
          console.error('❌ Failed to upload document:', err)
          setError(err)
          return { success: false, error: err }
        } finally {
          setLoading(false)
        }
      },

      // ✅ Fetch users
      fetchUsers: async () => {
        const { setLoading, setError } = get()
        setLoading(true)
        try {
          const res = await api.getUsers()
          if (res?.members) set({ users: res.members })
        } catch (err) {
          console.error('❌ Failed to fetch users:', err)
          setError(err)
        } finally {
          setLoading(false)
        }
      },

      // ✅ Reset global state (e.g. on logout)
      resetStore: () => {
        set({
          roles: [],
          documents: [],
          users: [],
          loading: false,
          error: null
        })
      }
    }
  })
)
