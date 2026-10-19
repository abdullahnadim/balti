'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Define the expected return state structure
export type ActionState = {
  success?: boolean
  error?: string
}

export async function createItem(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const title = formData.get('title') as string
  const listId = formData.get('listId') as string

  if (!title || !listId) {
    return { error: 'Title and list selection are required.' }
  }

  try {
    // Get the current highest position in the list
    const lastItem = await db.listItem.findFirst({
      where: { listId },
      orderBy: { position: 'desc' },
      select: { position: true }
    })

    const newPosition = lastItem ? lastItem.position + 1024 : 1024

    await db.listItem.create({
      data: {
        title,
        listId,
        position: newPosition
      }
    })

    // Revalidate the home page to instantly show the new item
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to create item:', error)
    return { error: 'Failed to save the item. Please try again.' }
  }
}
export async function toggleItemStatus(itemId: string, listId: string, isArchived: boolean) {
  try {
    await db.listItem.update({
      where: { id: itemId },
      data: { isArchived }
    })
    
    revalidatePath(`/l/${listId}`)
    revalidatePath('/') 
    
    return { success: true }
  } catch (error) {
    console.error('Failed to toggle item:', error)
    return { error: 'Failed to update the item.' }
  }
}

export async function reorderItems(listId: string, orderedIds: string[]) {
  try {
    // Run all updates efficiently in a single transaction
    const updates = orderedIds.map((id, index) =>
      db.listItem.update({
        where: { id },
        data: { position: index * 1024 }
      })
    )
    
    await db.$transaction(updates)
    revalidatePath(`/l/${listId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Failed to reorder items:', error)
    return { error: 'Failed to reorder items.' }
  }
}
export async function updateItem(itemId: string, title: string, listId: string) {
  try {
    await db.listItem.update({
      where: { id: itemId },
      data: { title }
    })
    revalidatePath(`/l/${listId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update item:', error)
    return { error: 'Failed to update item.' }
  }
}