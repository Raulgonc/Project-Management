import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Estendemos o tipo Request do Express para incluir campos extras
// Por padrão, req não tem userId nem userRole — adicionamos aqui após validar o token
export interface AuthRequest extends Request {
  userId?: string;   // ID do usuário logado
  userRole?: string; // Role do usuário: ADMIN, USER ou CLIENT
}

// Middleware de autenticação — verifica se o token JWT é válido
// É executado ANTES dos controllers nas rotas protegidas
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  // O token chega no header assim: Authorization: Bearer eyJhbGci...
  const authHeader = req.headers.authorization;

  // Se não veio o header ou não começa com "Bearer ", rejeita imediatamente
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  // Separa o header em duas partes: ["Bearer", "eyJhbGci..."] e pega só o token
  const token = authHeader.split(' ')[1];

  try {
    // Verifica se o token é válido e não expirou usando a chave secreta
    // Se for válido, retorna o payload que foi colocado no jwt.sign (userId e role)
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };

    // Anexa os dados do usuário à requisição para os próximos middlewares e controllers usarem
    req.userId = payload.userId;
    req.userRole = payload.role;

    // Chama o próximo middleware ou controller na cadeia
    next();
  } catch {
    // jwt.verify lança erro se o token for inválido, adulterado ou expirado
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// Middleware de autorização — verifica se o usuário tem permissão de ADMIN
// Deve ser usado APÓS o authMiddleware, pois depende do req.userRole já estar preenchido
export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'ADMIN') {
    // 403 = autenticado, mas sem permissão (diferente do 401 que é "não autenticado")
    res.status(403).json({ error: 'Acesso restrito a administradores' });
    return;
  }
  next();
}
