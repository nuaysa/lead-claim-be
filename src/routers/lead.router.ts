import { Router } from "express";
import { LeadsController } from "../controllers/leads.controller";
import { verifyToken } from "../middleware/verify";

export class LeadRouter {
  private leadController: LeadsController;
  private router: Router;

  constructor() {
    this.leadController = new LeadsController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/myleads", verifyToken, this.leadController.getMyLeads);
    this.router.get("/sales", verifyToken, this.leadController.getAllSalesClaims);
    this.router.patch("/claim/:id", verifyToken, this.leadController.claimLead);
    this.router.get("/", verifyToken, this.leadController.getUnclaimedLeads);
  }

  getRouter() {
    return this.router;
  }
}