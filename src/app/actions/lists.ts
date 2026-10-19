'use server'

import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

export type ListActionState = {
  error?: string
}

export async function createList(prevState: ListActionState, formData: FormData): Promise<ListActionState> {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const icon = formData.get('icon') as string || '📝'
  const accentColor = formData.get('accentColor') as string || '#111111'

  if (!name) return { error: 'List name is required' }

  let listId = ''

  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: 'You must be signed in to create a list.' }
    }

    const list = await db.list.create({
      data: {
        name,
        description,
        icon,
        accentColor,
        userId: session.user.id
      }
    })
    
    listId = list.id
  } catch (error) {
    console.error('Failed to create list:', error)
    return { error: 'Failed to create list. Please try again.' }
  }

  // Redirect the user straight to their newly created list
  redirect(`/l/${listId}`)
}

export async function deleteList(listId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    await db.list.delete({
      where: { 
        id: listId,
        userId: session.user.id // Ensure the user only deletes their own list
      }
    })
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to delete list:', error)
    return { error: 'Failed to delete list.' }
  }
  
  // Next.js requires redirect to be outside try/catch
  redirect('/')
}

export async function updateList(
  listId: string, 
  data: { name: string; description: string; icon: string; accentColor: string }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    await db.list.update({
      where: { 
        id: listId,
        userId: session.user.id // Ensure the user only updates their own list
      },
      data
    })
    
    revalidatePath(`/l/${listId}`)
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to update list:', error)
    return { error: 'Failed to update list.' }
  }
}