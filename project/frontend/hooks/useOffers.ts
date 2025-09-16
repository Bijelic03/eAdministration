import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    createOfferAPI,
    deleteOfferAPI,
    fetchOfferByIdAPI,
    fetchOffersAPI,
    updateOfferAPI,
} from '@/api/offers.api';

export default function useOffers() {
    const searchParams = useSearchParams();
    const pageParam = searchParams.get('page') || '1';
    const maxParam = searchParams.get('max') || '10';
    const search = searchParams.get('search') || '';

    const [values, setValues] = useState<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        offers: any[];
        page: number;
        totalItems: number;
        totalPages: number;
        loading: boolean;
        error: unknown | null;
    }>({
        offers: [],
        page: 1,
        totalItems: 0,
        totalPages: 0,
        loading: false,
        error: null,
    });
    const fetchOffers = async (page = pageParam, max = maxParam) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetchOffersAPI(
                Number(page),
                Number(max),
                search
            );
            setValues((prev) => ({
                ...prev,
                offers: response.data,
                page: response.page,
                totalItems: response.totalItems,
                totalPages: response.totalPages,
            }));
        } catch (error) {
            setValues((prev) => ({
                ...prev,
                error,
            }));
        } finally {
            setValues((prev) => ({ ...prev, loading: false }));
        }
    };

    const fetchOfferById = async (id: string) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const offer = await fetchOfferByIdAPI(id);
            setValues((prev) => ({
                ...prev,
            }));
            return offer;
        } catch (error) {
            setValues((prev) => ({
                ...prev,
                error,
            }));
        } finally {
            setValues((prev) => ({ ...prev, loading: false }));
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createOffer = async (data: any) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const newOffer = await createOfferAPI(data);
            setValues((prev) => ({
                ...prev,
                offers: [...prev.offers, newOffer],
            }));
            return newOffer;
        } catch (error) {
            setValues((prev) => ({
                ...prev,
                error,
            }));
            throw error;
        } finally {
            setValues((prev) => ({ ...prev, loading: false }));
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateOffer = async (data: any) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const updatedOffer = await updateOfferAPI(data);
            setValues((prev) => ({
                ...prev,
                offers: prev.offers.map((c) =>
                    c.id === updatedOffer.id ? updatedOffer : c
                ),
            }));
            return updatedOffer;
        } catch (error) {
            setValues((prev) => ({
                ...prev,
                error,
            }));
            throw error;
        } finally {
            setValues((prev) => ({ ...prev, loading: false }));
        }
    };

    const deleteOffer = async (id: string) => {
        setValues((prev) => ({ ...prev, loading: true, error: null }));
        try {
            await deleteOfferAPI(id);
            await fetchOffers();
            setValues((prev) => ({
                ...prev,
            }));
        } catch (error) {
            setValues((prev) => ({
                ...prev,
                error,
            }));
            throw error;
        } finally {
            setValues((prev) => ({ ...prev, loading: false }));
        }
    };

    return {
        values,
        setValues,
        fetchOffers,
        fetchOfferById,
        createOffer,
        updateOffer,
        deleteOffer,
    };
}
