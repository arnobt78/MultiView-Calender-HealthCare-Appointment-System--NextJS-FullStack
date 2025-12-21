// Helper to get current user id on the client
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/me");
    if (response.ok) {
      const data = await response.json();
      return data?.user?.id || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
}
