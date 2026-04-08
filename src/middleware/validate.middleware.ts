import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Middleware genérico de validação — recebe um schema Zod e valida o req.body
// Se os dados não baterem com o schema, retorna os erros sem chegar no controller
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // schema.parse lança um ZodError se os dados forem inválidos
      // Se passar, substitui o req.body pelos dados já validados e tipados
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata os erros do Zod em um formato legível
        // error.errors é um array com todos os campos que falharam
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'), // Caminho do campo — ex: "email" ou "address.city"
          message: e.message,
        }));

        res.status(400).json({ errors });
        return;
      }
      // Se for outro tipo de erro, passa para o próximo middleware
      next(error);
    }
  };
}
