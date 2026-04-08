import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as userService from '../services/user.service';

export async function getAllUsers(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await userService.findById(req.params.id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Usuário só pode editar a si mesmo, a menos que seja ADMIN
    if (req.userId !== id && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Sem permissão para editar este usuário' });
      return;
    }

    const { name, email } = req.body;
    const user = await userService.update(id, { name, email });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    await userService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}
