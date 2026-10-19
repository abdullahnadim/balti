'use server'

import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password || !name) return { error: 'All fields are required.' }

  try {
    const existingUser = await db.user.findUnique({ where: { email } })
    if (existingUser) return { error: 'Email already exists.' }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.create({
      data: { name, email, password: hashedPassword }
    })
  } catch (error) {
    return { error: 'Something went wrong.' }
  }

  redirect('/login')
}

export async function loginUser(prevState: any, formData: FormData) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password.' }
        default:
          return { error: 'Something went wrong.' }
      }
    }
    throw error // Required for NextAuth redirects to work
  }
}