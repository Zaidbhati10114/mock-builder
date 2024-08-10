"use client"
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";



export function useIsSubscribed() {

    const user = useQuery(api.users.getUser);
    const MAX_PROJECTS = user?.isPro ? 20 : 2;
    const MAX_RESOURCES = user?.isPro ? 20 : 2;

    return { user, MAX_PROJECTS, MAX_RESOURCES }
};