export const fetchMessages = async ({ token, chatbotName }) => {
  const res = await fetch(`/api/messages/get?chatbotName=${encodeURIComponent(chatbotName)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  })
  if (!res.ok) {
    const { err } = await res.json().catch(() => ({}))
    throw new Error(err || "Failed to load messages")
  }
  return res.json()
}

export const addMessageApi = async ({ token, chatbotName, role, text }) => {
  const res = await fetch(`/api/messages/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ chatbotName, role, text })
  })
  if (!res.ok) {
    const { err } = await res.json().catch(() => ({}))
    throw new Error(err || "Failed to add message")
  }
  return res.json()
}


