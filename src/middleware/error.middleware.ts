import { Request, Response, NextFunction } from 'express';

// Classe customizada para erros da aplicação
// Permite lançar erros com status HTTP específico em qualquer lugar do código
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Middleware de tratamento de erros — deve ser registrado POR ÚLTIMO no main.ts
// O Express identifica esse middleware pelos 4 parâmetros (err, req, res, next)
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Erro conhecido da aplicação — lançado intencionalmente com statusCode
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Erro do Prisma — violação de campo único (ex: email duplicado)
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      res.status(409).json({ error: 'Já existe um registro com esse valor único' });
      return;
    }
    if (prismaError.code === 'P2025') {
      res.status(404).json({ error: 'Registro não encontrado' });
      return;
    }
  }

  // Erro inesperado — não expõe detalhes internos em produção
  console.error('Unexpected error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message,
  });
}
