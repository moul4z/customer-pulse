import type {
  Customer,
  CustomerStatus,
  CustomerWithHealth,
} from "../types/customer";

function limitScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function calculateHealthScore(customer: Customer): number {
  const engagementScore = customer.engagement;

  const satisfactionScore = customer.nps * 10;

  const ticketScore = limitScore(100 - customer.openTickets * 12);

  const relationshipScore = limitScore(
    100 - customer.daysWithoutContact * 3,
  );

  const finalScore =
    engagementScore * 0.35 +
    satisfactionScore * 0.25 +
    ticketScore * 0.2 +
    relationshipScore * 0.2;

  return Math.round(finalScore);
}

export function getCustomerStatus(score: number): CustomerStatus {
  if (score >= 75) {
    return "healthy";
  }

  if (score >= 50) {
    return "attention";
  }

  return "risk";
}

export function getNextAction(customer: Customer, score: number): string {
  if (score < 50) {
    return "Criar plano de retenção";
  }

  if (customer.openTickets >= 4) {
    return "Priorizar chamados abertos";
  }

  if (customer.daysWithoutContact >= 15) {
    return "Agendar reunião de acompanhamento";
  }

  if (customer.nps >= 9 && customer.engagement >= 80) {
    return "Avaliar oportunidade de expansão";
  }

  return "Manter acompanhamento";
}

export function enrichCustomer(customer: Customer): CustomerWithHealth {
  const healthScore = calculateHealthScore(customer);

  return {
    ...customer,
    healthScore,
    status: getCustomerStatus(healthScore),
    nextAction: getNextAction(customer, healthScore),
  };
}