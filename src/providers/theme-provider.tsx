"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// CORREÇÃO: Removemos o "/dist/types" e usamos React.ComponentProps
// Isso é mais seguro e compatível com qualquer versão

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}