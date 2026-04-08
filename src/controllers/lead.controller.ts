import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as leadService from '../services/lead.service';
import { LeadStatus, LeadSource } from '@prisma/client';

export async function getAllLeads(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Pega os filtros da URL — ex: /leads?status=NEW&source=WEBSITE
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

export async function getLeadById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const lead = await leadService.findById(req.params.id);
    res.json(lead);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

export async function createLead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, email, phone, company, source, notes } = req.body;

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

export async function updateLead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const lead = await leadService.update(req.params.id, req.body);
    res.json(lead);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteLead(req: AuthRequest, res: Response): Promise<void> {
  try {
    await leadService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

export async function convertLead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const client = await leadService.convertToClient(req.params.id);
    res.status(201).json(client);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
