import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export async function registerController(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    // Validação básica dos campos obrigatórios
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      return;
    }

    const result = await authService.register(name, email, password);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function loginController(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' });
      return;
    }

    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}
