// Save both the token and the onboarding status
export const saveToken = (token, isOnboarded) => {
  localStorage.setItem("token", token);
  // Store status as "true" or "false" string
  localStorage.setItem("isOnboarded", isOnboarded ? "true" : "false");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

// New helper to check if the user is allowed to see the dashboard
export const isUserOnboarded = () => {
  const status = localStorage.getItem("isOnboarded");
  return status === "true"; // Returns true only if they finished details
};

export const removeToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("isOnboarded"); // Clean up everything on logout
};