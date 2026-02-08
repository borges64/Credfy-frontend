import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// MUDANÇA AQUI: Adicionamos 'default' para evitar o erro de export name
export default function middleware(request: NextRequest) {
  
  // 1. Pega o token dos cookies
  const token = request.cookies.get('token')?.value

  // 2. Define as URLs para redirecionamento
  const signInURL = new URL('/', request.url)
  const dashboardURL = new URL('/dashboard', request.url)

  // 3. Lógica de Proteção:

  // Se NÃO tem token e tenta acessar qualquer rota que comece com /dashboard
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(signInURL)
    }
  }

  // Se TEM token e tenta acessar a página de login (/)
  if (token) {
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(dashboardURL)
    }
  }

  // Permite que a requisição continue
  return NextResponse.next()
}

// Configuração: Onde o middleware deve rodar
export const config = {
  matcher: [
    '/', 
    '/dashboard/:path*'
  ]
}