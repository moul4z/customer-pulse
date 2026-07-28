import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Search,
  Users,
} from "lucide-react";

import { CustomerDetailsModal } from "./components/CustomerDetailsModal";
import { customers } from "./data/customers";
import type {
  CustomerStatus,
  CustomerWithHealth,
  FollowUp,
} from "./types/customer";
import { enrichCustomer } from "./utils/customerHealth";

type StatusFilter = "all" | CustomerStatus;

const statusLabels: Record<CustomerStatus, string> = {
  healthy: "Saudável",
  attention: "Atenção",
  risk: "Em risco",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function App() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithHealth | null>(null);

    const [followUps, setFollowUps] = useState<FollowUp[]>(
  () => {
    const savedFollowUps = localStorage.getItem(
      "customer-pulse-follow-ups",
    );

    if (!savedFollowUps) {
      return [];
    }

    try {
      return JSON.parse(savedFollowUps) as FollowUp[];
    } catch {
      return [];
    }
  },
);

useEffect(() => {
  localStorage.setItem(
    "customer-pulse-follow-ups",
    JSON.stringify(followUps),
  );
}, [followUps]);

  const enrichedCustomers = useMemo(
    () => customers.map(enrichCustomer),
    [],
  );

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return enrichedCustomers.filter((customer) => {
      const matchesSearch =
        customer.company.toLowerCase().includes(normalizedSearch) ||
        customer.contactName.toLowerCase().includes(normalizedSearch) ||
        customer.segment.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrichedCustomers, search, statusFilter]);

  const metrics = useMemo(() => {
    const healthy = enrichedCustomers.filter(
      (customer) => customer.status === "healthy",
    ).length;

    const attention = enrichedCustomers.filter(
      (customer) => customer.status === "attention",
    ).length;

    const risk = enrichedCustomers.filter(
      (customer) => customer.status === "risk",
    ).length;

    const monthlyRevenue = enrichedCustomers.reduce(
      (total, customer) => total + customer.monthlyRevenue,
      0,
    );

    return {
      total: enrichedCustomers.length,
      healthy,
      attention,
      risk,
      monthlyRevenue,
    };
  }, [enrichedCustomers]);

  function handleRegisterFollowUp(
  customerId: number,
  followUpData: Omit<
    FollowUp,
    "id" | "customerId" | "createdAt"
  >,
) {
  const newFollowUp: FollowUp = {
    id: crypto.randomUUID(),
    customerId,
    createdAt: new Date().toISOString(),
    ...followUpData,
  };

  setFollowUps((currentFollowUps) => [
    newFollowUp,
    ...currentFollowUps,
  ]);
}

function handleDeleteFollowUp(followUpId: string) {
  setFollowUps((currentFollowUps) =>
    currentFollowUps.filter(
      (followUp) => followUp.id !== followUpId,
    ),
  );
}

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <div className="brand">
              <div className="brand-icon">CP</div>

              <div>
                <h1>CustomerPulse</h1>
                <span>Customer Success Intelligence</span>
              </div>
            </div>
          </div>

          <div className="profile">
            <div className="profile-avatar">DM</div>

            <div>
              <strong>Daniel Moulaz</strong>
              <span>Customer Success</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="page-heading">
          <div>
            <span className="eyebrow">VISÃO GERAL</span>

            <h2>Saúde da carteira de clientes</h2>

            <p>
              Acompanhe engajamento, satisfação e riscos para
              priorizar as próximas ações.
            </p>
          </div>

          <div className="last-update">
            Atualizado agora
          </div>
        </section>

        <section className="metrics-grid">
          <article className="metric-card">
            <div className="metric-icon total">
              <Users size={22} />
            </div>

            <div>
              <span>Total de clientes</span>
              <strong>{metrics.total}</strong>
              <small>Clientes monitorados</small>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon healthy">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Clientes saudáveis</span>
              <strong>{metrics.healthy}</strong>
              <small>Boa experiência e engajamento</small>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon attention">
              <AlertTriangle size={22} />
            </div>

            <div>
              <span>Precisam de atenção</span>
              <strong>{metrics.attention}</strong>
              <small>Acompanhamento recomendado</small>
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-icon risk">
              <AlertTriangle size={22} />
            </div>

            <div>
              <span>Em risco</span>
              <strong>{metrics.risk}</strong>
              <small>Ação de retenção necessária</small>
            </div>
          </article>

          <article className="metric-card revenue-card">
            <div className="metric-icon revenue">
              <CircleDollarSign size={22} />
            </div>

            <div>
              <span>Receita mensal</span>

              <strong>
                {formatCurrency(metrics.monthlyRevenue)}
              </strong>

              <small>Valor total da carteira</small>
            </div>
          </article>
        </section>

        <section className="customers-section">
          <div className="section-header">
            <div>
              <h3>Clientes</h3>

              <p>
                {filteredCustomers.length} cliente
                {filteredCustomers.length !== 1 ? "s" : ""} encontrado
                {filteredCustomers.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="filters">
              <label className="search-field">
                <Search size={18} />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Buscar cliente..."
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as StatusFilter,
                  )
                }
                aria-label="Filtrar clientes por status"
              >
                <option value="all">Todos os status</option>
                <option value="healthy">Saudáveis</option>
                <option value="attention">Atenção</option>
                <option value="risk">Em risco</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Health Score</th>
                  <th>Engajamento</th>
                  <th>NPS</th>
                  <th>Chamados</th>
                  <th>Status</th>
                  <th>Próxima ação</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="customer-row"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td>
                      <div className="customer-cell">
                        <div className="company-avatar">
                          {customer.company
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <div>
                          <strong>{customer.company}</strong>

                          <span>
                            {customer.contactName} ·{" "}
                            {customer.segment}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="score-cell">
                        <strong>{customer.healthScore}</strong>

                        <div className="score-bar">
                          <span
                            className={`score-progress ${customer.status}`}
                            style={{
                              width: `${customer.healthScore}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>{customer.engagement}%</td>
                    <td>{customer.nps}/10</td>
                    <td>{customer.openTickets}</td>

                    <td>
                      <span
                        className={`status-badge ${customer.status}`}
                      >
                        {statusLabels[customer.status]}
                      </span>
                    </td>

                    <td>
                      <span className="next-action">
                        {customer.nextAction}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        Nenhum cliente encontrado com esses filtros.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {selectedCustomer && (
  <CustomerDetailsModal
    customer={selectedCustomer}
    followUps={followUps.filter(
      (followUp) =>
        followUp.customerId === selectedCustomer.id,
    )}
    onRegisterFollowUp={(followUpData) =>
      handleRegisterFollowUp(
        selectedCustomer.id,
        followUpData,
      )
    }
    onDeleteFollowUp={handleDeleteFollowUp}
    onClose={() => setSelectedCustomer(null)}
  />
)}
    </div>
  );
}

export default App;