export const getToken = (): string | null => {
  const saved = localStorage.getItem('infokop_auth')
  return saved ? JSON.parse(saved).access : null
}