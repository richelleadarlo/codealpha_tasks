import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types';

export function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  const handleClick = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      handler();
    }
  }, [ref, handler]);

  return { handleClick };
}

export async function searchUserByEmail(email: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  return data as Profile | null;
}
