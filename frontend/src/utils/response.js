export function extractList(response) {
  const body = response?.data
  if (Array.isArray(body)) return body
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body?.items)) return body.items
  if (Array.isArray(body?.results)) return body.results
  return []
}

export function getErrorMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.response?.data?.error || fallback
}