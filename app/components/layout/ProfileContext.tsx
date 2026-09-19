'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, ApiResult } from '@/types/api';

interface ProfileContextType {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}

const ProfileContext = createContext<ProfileContextType>({
    profile: null,
    isLoading: true,
    error: null,
});

export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/users/perfil');
                const result = (await res.json()) as ApiResult<UserProfile>;

                if (result.success) {
                    setProfile(result.data);
                } else {
                    setError(result.error || 'Error al obtener el perfil');
                }
            } catch (err) {
                setError('Error de conexión');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, isLoading, error }}>
            {children}
        </ProfileContext.Provider>
    );
}
