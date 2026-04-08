import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as clientService from '../services/client.service';

export async function getAllClients(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const clients = await clientService.findAll();
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getClientById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = await clientService.findById(req.params.id);
    res.json(client);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

export async function createClient(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, phone, company, contractInfo, notes } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Nome e email são obrigatórios' });
      return;
    }

    const client = await clientService.create({ name, email, phone, company, contractInfo, notes });
    res.status(201).json(client);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateClient(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = await clientService.update(req.params.id, req.body);
    res.json(client);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteClient(req: AuthRequest, res: Response): Promise<void> {
  try {
    await clientService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}
