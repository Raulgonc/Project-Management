import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as userService from '../services/user.service';

// Usamos AuthRequest em vez de Request porque precisamos de req.userId e req.userRole
// Esses campos são adicionados pelo authMiddleware após validar o token JWT

// Lista todos os usuários — restrito a ADMIN (definido nas rotas)
// GET /users
export async function getAllUsers(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await userService.findAll();
    res.json(users); // 200 implícito quando não especificado
  } catch (error: any) {
    // 500 = erro interno do servidor (algo inesperado aconteceu)
    res.status(500).json({ error: error.message });
  }
}

// Busca um usuário pelo ID — qualquer usuário logado pode usar
// GET /users/:id
export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    // req.params.id lê o :id que vem direto na URL — ex: /users/abc-123
    const user = await userService.findById(req.params.id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

// Atualiza nome e/ou email de um usuário
// PATCH /users/:id — body: { name?, email? }
export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Regra de negócio: só o próprio usuário ou um ADMIN pode editar
    // req.userId vem do token JWT (preenchido pelo authMiddleware)
    if (req.userId !== id && req.userRole !== 'ADMIN') {
      // 403 = autenticado mas sem permissão (diferente de 401 que é "não autenticado")
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

// Remove um usuário permanentemente — restrito a ADMIN (definido nas rotas)
// DELETE /users/:id
export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    await userService.remove(req.params.id);
    // 204 = sucesso sem conteúdo para retornar (comum em operações de delete)
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}
