import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que precisam de proteção
const protectedRoutes = ['/dashboard']

export function middleware(request: NextRequest) {
  // Pega o token dos cookies
  const token = request.cookies.get('token')?.value

  // Se o usuário tentar acessar rota protegida SEM token
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (!token) {
          // Redireciona para o login
          return NextResponse.redirect(new URL('/', request.url))
      }
  }

  // Se o usuário JÁ tem token e tenta acessar a tela de login ('/')
  if (request.nextUrl.pathname === '/') {
      if (token) {
          // Joga direto pro dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }
  }

  return NextResponse.next()
}

// Configuração: Em quais rotas esse arquivo vai rodar
export const config = {
  matcher: ['/', '/dashboard/:path*'],
}
