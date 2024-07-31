// app/stores/useBreadcrumbStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type BreadcrumbItem = {
    href: string;
    label: string;
};

type BreadcrumbStore = {
    breadcrumbs: BreadcrumbItem[];
    updateBreadcrumbs: (newBreadcrumbs: BreadcrumbItem[]) => void;
};

export const useBreadcrumbStore = create(
    persist<BreadcrumbStore>(
        (set) => ({
            breadcrumbs: [],
            updateBreadcrumbs: (newBreadcrumbs) => set({ breadcrumbs: newBreadcrumbs }),
        }),
        {
            name: 'breadcrumb-storage',
        }
    )
);