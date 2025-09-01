import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      firstName?: string
      lastName?: string
      username?: string
      profileImage?: string
      role?: string
      roleDisplayName?: string
      accessToken?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    firstName?: string
    lastName?: string
    username?: string
    profileImage?: string
    role?: string
    roleDisplayName?: string
  }
}