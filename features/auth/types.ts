export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
};

export type AuthSession = {
  user: User;
  token: string;
};
