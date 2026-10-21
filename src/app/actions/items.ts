'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

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
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    // Security check: Ensure the user actually owns the list they are adding to
    const list = await db.list.findUnique({
      where: { id: listId, userId: session.user.id }
    })
    
    if (!list) return { error: 'Unauthorized to modify this collection.' }

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
        position: newPosition,
        status: 'todo',
        priority: 0,
        metadata: {}
      }
    })

    // Revalidate both the dashboard and the specific list page
    revalidatePath(`/l/${listId}`)
    revalidatePath('/')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to create item:', error)
    return { error: 'Failed to save the item. Please try again.' }
  }
}

export async function toggleItemStatus(itemId: string, listId: string, isArchived: boolean) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    const list = await db.list.findUnique({
      where: { id: listId, userId: session.user.id }
    })
    if (!list) return { error: 'Unauthorized' }

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
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    const list = await db.list.findUnique({
      where: { id: listId, userId: session.user.id }
    })
    if (!list) return { error: 'Unauthorized' }

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

export async function updateItemDetails(
  itemId: string, 
  listId: string, 
  data: { title?: string; notes?: string | null; priority?: number }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    const list = await db.list.findUnique({
      where: { id: listId, userId: session.user.id }
    })
    if (!list) return { error: 'Unauthorized' }

    await db.listItem.update({
      where: { id: itemId },
      data
    })
    
    revalidatePath(`/l/${listId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update item details:', error)
    return { error: 'Failed to update item.' }
  }
}

export async function sortItemsByPriority(listId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Unauthorized' }

    const list = await db.list.findUnique({
      where: { id: listId, userId: session.user.id }
    })
    if (!list) return { error: 'Unauthorized' }

    // Fetch only active items to sort
    const items = await db.listItem.findMany({
      where: { listId, isArchived: false },
      orderBy: { position: 'asc' }
    })

    // Sort: Highest priority first. If tied, keep existing drag-and-drop order.
    const sortedItems = [...items].sort((a, b) => {
      if (b.priority !== a.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }
      return a.position - b.position;
    });

    // Run updates in a single transaction
    const updates = sortedItems.map((item, index) =>
      db.listItem.update({
        where: { id: item.id },
        data: { position: index * 1024 }
      })
    )
    
    await db.$transaction(updates)
    revalidatePath(`/l/${listId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Failed to sort items:', error)
    return { error: 'Failed to sort items.' }
  }
}