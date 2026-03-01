const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = {
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/health`)
      return res.ok
    } catch {
      return false
    }
  },
}

