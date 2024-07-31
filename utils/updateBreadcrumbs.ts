// app/utils/updateBreadcrumbs.ts
import { useBreadcrumbStore } from '@/lib/store';

export const updateBreadcrumbs = (newCrumb: { href: string; label: string }) => {
    const { breadcrumbs, updateBreadcrumbs } = useBreadcrumbStore.getState();
    const newBreadcrumbs = [...breadcrumbs, newCrumb];
    updateBreadcrumbs(newBreadcrumbs);
};