import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

// Controller de registro — recebe a requisição HTTP e chama o service
// POST /auth/register — body: { name, email, password }
export async function registerController(req: Request, res: Response): Promise<void> {
  try {
    // req.body contém os dados enviados pelo frontend no corpo da requisição (JSON)
    const { name, email, password } = req.body;

    // Validação básica antes de chamar o service
    // Se algum campo obrigatório faltar, retorna erro imediatamente
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      return; // Interrompe a execução — sem isso o código continuaria
    }

    const result = await authService.register(name, email, password);

    // 201 = recurso criado com sucesso (diferente do 200 que é só "OK")
    res.status(201).json(result);
  } catch (error: any) {
    // Se o service lançar um erro (ex: email já cadastrado), capturamos aqui
    res.status(400).json({ error: error.message });
  }
}

// Controller de login — valida credenciais e retorna o token
// POST /auth/login — body: { email, password }
export async function loginController(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' });
      return;
    }

    const result = await authService.login(email, password);

    // 200 = OK, requisição bem-sucedida
    res.status(200).json(result);
  } catch (error: any) {
    // 401 = não autorizado — credenciais inválidas
    res.status(401).json({ error: error.message });
  }
}
