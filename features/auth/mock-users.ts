// In a real app these would be in a database with hashed passwords (bcrypt).
// For learning, we use plain text. Never do this in production.

export type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "member";
};

export const mockUsers: MockUser[] = [
  {
    id: "user-1",
    name: "Sokha Admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  },
  {
    id: "user-2",
    name: "Dara Member",
    email: "member@example.com",
    password: "password123",
    role: "member",
  },
];

export function findUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find((u) => u.email === email);
}
