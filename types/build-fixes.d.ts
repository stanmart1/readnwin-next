// Temporary type fixes for build
declare module '@/hooks/useLoadingState' {
  export function useLoadingState(): { isLoading: boolean };
  export function useSkeletonLoading(): { isLoading: boolean };
}

declare module '@/hooks/useBookManagement' {
  export function useBookManagement(): {
    books: any[];
    loading: boolean;
    error: any;
    filters: any;
    pagination: any;
    setFilters: (filters: any) => void;
    setPagination: (pagination: any) => void;
    updateBook: (id: number, data: any) => Promise<boolean>;
    deleteBooks: (ids: number[]) => Promise<boolean>;
    batchUpdateBooks: (ids: number[], data: any) => Promise<boolean>;
    setError: (error: any) => void;
  };
}

// Fix session type
declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string;
      email?: string;
      name?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      accessToken?: string;
      roleDisplayName?: string;
    };
  }
  
  interface User {
    id?: string;
    email?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    roleDisplayName?: string;
  }
}

// Fix Buffer type issues
declare global {
  interface Buffer {
    constructor: any;
  }
}