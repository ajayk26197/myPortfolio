// API service — connects frontend to backend
const BASE_URL = '/api'

// Send contact message
export const sendMessage = async (formData) => {
  const res = await fetch(`${BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

// Fetch all projects (from MongoDB)
export const fetchProjects = async () => {
  const res = await fetch(`${BASE_URL}/projects`)
  if (!res.ok) throw new Error('Failed to fetch projects')
  return res.json()
}
