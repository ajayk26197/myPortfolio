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

// Follower services
export const followUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/followers/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
  if (!res.ok) throw new Error('Failed to follow')
  return res.json()
}

export const unfollowUser = async (uid) => {
  const res = await fetch(`${BASE_URL}/followers/unfollow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid }),
  })
  if (!res.ok) throw new Error('Failed to unfollow')
  return res.json()
}

export const checkFollowStatus = async (uid) => {
  const res = await fetch(`${BASE_URL}/followers/status/${encodeURIComponent(uid)}`)
  if (!res.ok) throw new Error('Failed to check follow status')
  return res.json()
}

export const getFollowerCount = async () => {
  const res = await fetch(`${BASE_URL}/followers/count`)
  if (!res.ok) throw new Error('Failed to fetch follower count')
  return res.json()
}
