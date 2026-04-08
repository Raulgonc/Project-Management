import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as invoiceService from '../services/invoice.service';
import { InvoiceStatus } from '@prisma/client';

// Lista faturas com filtros opcionais
// Exemplos: GET /invoices | GET /invoices?status=OVERDUE | GET /invoices?clientId=abc
export async function getAllInvoices(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { clientId, status } = req.query;

    const invoices = await invoiceService.findAll({
      clientId: clientId as string,
      status: status as InvoiceStatus,
    });

    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// GET /invoices/:id — retorna fatura + itens + cliente + projeto
export async function getInvoiceById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const invoice = await invoiceService.findById(req.params.id);
    res.json(invoice);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

// POST /invoices — cria fatura com itens
// body: { clientId, items: [{ description, quantity, unitPrice, total }], projectId?, billingType?, dueDate?, notes? }
export async function createInvoice(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { clientId, projectId, billingType, dueDate, notes, items } = req.body;

    if (!clientId) {
      res.status(400).json({ error: 'Cliente é obrigatório' });
      return;
    }

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'A fatura precisa ter ao menos um item' });
      return;
    }

    const invoice = await invoiceService.create({
      clientId,
      projectId,
      billingType,
      notes,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      items,
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// PATCH /invoices/:id — atualiza status, tipo de cobrança, vencimento ou notas
// Não permite editar itens após criação — para isso deve cancelar e criar nova fatura
export async function updateInvoice(req: AuthRequest, res: Response): Promise<void> {
  try {
    const invoice = await invoiceService.update(req.params.id, req.body);
    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// DELETE /invoices/:id — restrito a ADMIN (definido nas rotas)
export async function deleteInvoice(req: AuthRequest, res: Response): Promise<void> {
  try {
    await invoiceService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}
