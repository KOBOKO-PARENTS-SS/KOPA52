'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server'; // Adjust this path based on where your Supabase server client helper lives

export type FormState = {
  success?: boolean;
  error?: string | null;
};

export async function addLearner(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const learnerCode = formData.get('learnerCode') as string;
  const grade = formData.get('grade') as string;
  const className = formData.get('className') as string;

  // Basic validation
  if (!firstName || !lastName || !learnerCode) {
    return { success: false, error: 'First Name, Last Name, and Learner ID are required.' };
  }

  // Insert into Supabase
  const { error } = await supabase.from('learners').insert([
    {
      first_name: firstName,
      last_name: lastName,
      learner_code: learnerCode,
      grade: grade || null,
      class_name: className || null,
    },
  ]);

  if (error) {
    console.error('Supabase error:', error);
    return { success: false, error: error.message };
  }

  // Purge cache for pages showing updated learner lists
  revalidatePath('/admin/dashboard');
  revalidatePath('/reports');

  return { success: true, error: null };
}