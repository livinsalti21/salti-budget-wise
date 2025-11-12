import { supabase } from '@/integrations/supabase/client';

export async function hasRole(userId: string, role: 'admin' | 'teacher' | 'student'): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: role
    });

    if (error) {
      console.error('Error checking role:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in hasRole:', error);
    return false;
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'admin');
}

export async function isTeacher(userId: string): Promise<boolean> {
  return hasRole(userId, 'teacher');
}

export async function isStudent(userId: string): Promise<boolean> {
  return hasRole(userId, 'student');
}
