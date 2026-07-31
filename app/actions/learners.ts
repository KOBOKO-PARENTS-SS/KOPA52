'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server'; // Adjust this path if using a different helper location

export type FormState = {
  success?: boolean;
  error?: string | null;
};

export async function addLearner(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();

  // Extract form fields matching the new modal component names
  const lin = formData.get('lin') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const otherNames = formData.get('otherNames') as string;
  const gender = formData.get('gender') as string;
  const currentClass = formData.get('currentClass') as string;
  const stream = formData.get('stream') as string;
  const nationality = formData.get('nationality') as string;

  // Basic validation using the new LIN field
  if (!lin || !firstName || !lastName) {
    return { success: false, error: 'LIN, First Name, and Last Name are required.' };
  }

  // Insert into Supabase using corresponding column names
  const { error } = await supabase.from('learners').insert([
    {
      lin: lin,
      first_name: firstName,
      last_name: lastName,
      other_names: otherNames || null,
      gender: gender || null,
      current_class: currentClass || null,
      stream: stream || null,
      nationality: nationality || null,
    },
  ]);

  if (error) {
    console.error('Supabase error:', error);
    return { success: false, error: error.message };
  }

  // Purge cache for pages displaying updated learner lists
  revalidatePath('/admin/dashboard');
  revalidatePath('/reports');

  return { success: true, error: null };
}