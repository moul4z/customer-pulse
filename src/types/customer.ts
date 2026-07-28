export type CustomerStatus = "healthy" | "attention" | "risk";

export interface Customer {
  id: number;
  company: string;
  contactName: string;
  segment: string;
  monthlyRevenue: number;
  engagement: number;
  nps: number;
  openTickets: number;
  daysWithoutContact: number;
}

export interface CustomerWithHealth extends Customer {
  healthScore: number;
  status: CustomerStatus;
  nextAction: string;
}
export type ContactType =
  | "meeting"
  | "call"
  | "email"
  | "whatsapp";

export interface FollowUp {
  id: string;
  customerId: number;
  contactType: ContactType;
  notes: string;
  nextContactDate: string;
  createdAt: string;
}