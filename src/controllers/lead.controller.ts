import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as leadService from '../services/lead.service';
import { LeadStatus, LeadSource } from '@prisma/client';

// Lista todos os leads — aceita filtros opcionais via URL
// Exemplos: GET /leads | GET /leads?status=NEW | GET /leads?source=WEBSITE&status=CONTACTED
export async function getAllLeads(req: AuthRequest, res: Response): Promise<void> {
  try {
    // req.query lê os parâmetros que vêm depois do "?" na URL
    // Diferente do req.body (corpo da requisição) que é usado no POST/PATCH
    const { status, source } = req.query;

    const leads = await leadService.findAll({
      status: status as LeadStatus,
      source: source as LeadSource,
    });

    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// GET /leads/:id
export async function getLeadById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const lead = await leadService.findById(req.params.id);
    res.json(lead);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

// POST /leads — body: { name, email, phone?, company?, source?, notes? }
export async function createLead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, phone, company, source, notes } = req.body;

    // name e email são os únicos obrigatórios — os demais podem ser preenchidos depois
    if (!name || !email) {
      res.status(400).json({ error: 'Nome e email são obrigatórios' });
      return;
    }

    const lead = await leadService.create({ name, email, phone, company, source, notes });
    res.status(201).json(lead);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// PATCH /leads/:id — body com qualquer campo de UpdateLeadData
export async function updateLead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const lead = await leadService.update(req.params.id, req.body);
    res.json(lead);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// DELETE /leads/:id — restrito a ADMIN (definido nas rotas)
export async function deleteLead(req: AuthRequest, res: Response): Promise<void> {
  try {
    await leadService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

// POST /leads/:id/convert — converte o lead em cliente
// Usamos POST porque é uma ação, não apenas uma edição de dados
export async function convertLead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = await leadService.convertToClient(req.params.id);
    // 201 porque um novo recurso (cliente) foi criado durante a conversão
    res.status(201).json(client);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
