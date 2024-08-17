// hooks/useDashboardTheme.ts
import { useTheme } from 'next-themes'

export const useDashboardTheme = () => {
    const { theme, setTheme } = useTheme()
    return { theme, setTheme }
}