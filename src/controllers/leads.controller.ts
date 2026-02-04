
import { getSalesStatsByDateService } from "../services/leads/getAllSales.service";
import { claimLeadService } from "../services/leads/claimLead.service";
import { getUnclaimedLeadsService } from "../services/leads/getAllLeads.service";
import { getMyLeadsService } from "../services/leads/getLeadsByUserId.service";
import { Request, Response } from "express";

export class LeadsController {
  async getUnclaimedLeads(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const data = await getUnclaimedLeadsService(page, limit);

    res.json({
      success: true,
      ...data,
    });
  }

  async getAllSalesClaims(req: Request, res: Response) {
    const { start, end } = req.query;
    const startDate = start ? new Date(`${start}T00:00:00.000`) : undefined;

    const endDate = end ? new Date(`${end}T23:59:59.999`) : undefined;

    const data = await getSalesStatsByDateService(startDate, endDate);

    res.json({
      success: true,
      data,
    });
  }

  async claimLead(req: Request, res: Response) {
    const leadId = Number(req.params.id);
    const salesId = req.user?.id || 0;

    try {
      const data = await claimLeadService(leadId, salesId);
      res.json(data);
    } catch (err: any) {
      res.status(err.status || 500).json({ message: err.message });
    }
  }

  async getMyLeads(req: Request, res: Response) {
    const salesId = req.user?.id || 0;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const data = await getMyLeadsService(salesId, page, limit);

    res.json({
      success: true,
      ...data,
    });
  }
}
