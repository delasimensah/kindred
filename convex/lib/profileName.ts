export function displayNameForNewProfile(user: {
  name?: string;
  email?: string;
}): string {
  const name = user.name?.trim() ?? "";
  if (name.length > 0) {
    return name;
  }
  const email = user.email ?? "";
  const localPart = email.includes("@") ? email.split("@")[0] : "";
  if (localPart.length > 0) {
    return localPart;
  }
  return "Fan";
}
