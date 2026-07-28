import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Headphones,
  History,
  MessageSquare,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import type {
  ContactType,
  CustomerWithHealth,
  FollowUp,
} from "../types/customer";

interface CustomerDetailsModalProps {
  customer: CustomerWithHealth;
  followUps: FollowUp[];

  onRegisterFollowUp: (
    followUp: Omit<
      FollowUp,
      "id" | "customerId" | "createdAt"
    >,
  ) => void;

  onDeleteFollowUp: (followUpId: string) => void;
  onClose: () => void;
}

interface FeedbackMessage {
  type: "success" | "error";
  message: string;
}

const statusLabels = {
  healthy: "Saudável",
  attention: "Atenção",
  risk: "Em risco",
};

const contactTypeLabels: Record<ContactType, string> = {
  meeting: "Reunião",
  call: "Ligação",
  email: "E-mail",
  whatsapp: "WhatsApp",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: string): string {
  if (!date) {
    return "Não definida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(`${date}T12:00:00`));
}

function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getTodayInputValue(): string {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 10);
}

export function CustomerDetailsModal({
  customer,
  followUps,
  onRegisterFollowUp,
  onDeleteFollowUp,
  onClose,
}: CustomerDetailsModalProps) {
  const [showForm, setShowForm] = useState(false);

  const [contactType, setContactType] =
    useState<ContactType>("meeting");

  const [notes, setNotes] = useState("");
  const [nextContactDate, setNextContactDate] = useState("");

  const [feedback, setFeedback] =
    useState<FeedbackMessage | null>(null);

  const today = getTodayInputValue();

  function showFeedback(
    type: FeedbackMessage["type"],
    message: string,
  ) {
    setFeedback({ type, message });

    window.setTimeout(() => {
      setFeedback(null);
    }, 3000);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedNotes = notes.trim();

    if (!normalizedNotes) {
      showFeedback(
        "error",
        "Preencha as observações do acompanhamento.",
      );

      return;
    }

    if (
      nextContactDate &&
      nextContactDate < today
    ) {
      showFeedback(
        "error",
        "A data do próximo contato não pode estar no passado.",
      );

      return;
    }

    onRegisterFollowUp({
      contactType,
      notes: normalizedNotes,
      nextContactDate,
    });

    setNotes("");
    setNextContactDate("");
    setContactType("meeting");
    setShowForm(false);

    showFeedback(
      "success",
      "Acompanhamento salvo com sucesso.",
    );
  }

  function handleDeleteFollowUp(followUpId: string) {
    const confirmed = window.confirm(
      "Deseja realmente excluir este acompanhamento?",
    );

    if (!confirmed) {
      return;
    }

    onDeleteFollowUp(followUpId);

    showFeedback(
      "success",
      "Acompanhamento excluído.",
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="customer-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div className="modal-customer">
            <div className="modal-avatar">
              {customer.company
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div>
              <span className="modal-eyebrow">
                DETALHES DO CLIENTE
              </span>

              <h2>{customer.company}</h2>

              <p>
                {customer.contactName} · {customer.segment}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Fechar detalhes"
          >
            <X size={20} />
          </button>
        </header>

        {feedback && (
          <div className={`modal-feedback ${feedback.type}`}>
            {feedback.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}

            <span>{feedback.message}</span>
          </div>
        )}

        <div className="modal-score-section">
          <div>
            <span>Customer Health Score</span>
            <strong>{customer.healthScore}</strong>
          </div>

          <span className={`status-badge ${customer.status}`}>
            {statusLabels[customer.status]}
          </span>
        </div>

        <div className="modal-score-bar">
          <span
            className={`score-progress ${customer.status}`}
            style={{ width: `${customer.healthScore}%` }}
          />
        </div>

        <div className="details-grid">
          <article className="detail-card">
            <TrendingUp size={19} />
            <span>Engajamento</span>
            <strong>{customer.engagement}%</strong>
          </article>

          <article className="detail-card">
            <MessageSquare size={19} />
            <span>NPS</span>
            <strong>{customer.nps}/10</strong>
          </article>

          <article className="detail-card">
            <Headphones size={19} />
            <span>Chamados abertos</span>
            <strong>{customer.openTickets}</strong>
          </article>

          <article className="detail-card">
            <CalendarDays size={19} />
            <span>Dias sem contato</span>
            <strong>{customer.daysWithoutContact}</strong>
          </article>

          <article className="detail-card detail-card-wide">
            <CircleDollarSign size={19} />
            <span>Receita mensal</span>

            <strong>
              {formatCurrency(customer.monthlyRevenue)}
            </strong>
          </article>
        </div>

        <div
          className={`recommendation-box ${customer.status}`}
        >
          <span>Próxima ação recomendada</span>
          <strong>{customer.nextAction}</strong>

          <p>
            Recomendação gerada automaticamente com base no
            engajamento, satisfação, chamados e tempo desde o
            último contato.
          </p>
        </div>

        {showForm && (
          <form
            className="follow-up-form"
            onSubmit={handleSubmit}
          >
            <div className="follow-up-form-header">
              <div>
                <span>NOVO REGISTRO</span>
                <h3>Registrar acompanhamento</h3>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Cancelar registro"
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              <label>
                Tipo de contato

                <select
                  value={contactType}
                  onChange={(event) =>
                    setContactType(
                      event.target.value as ContactType,
                    )
                  }
                >
                  <option value="meeting">Reunião</option>
                  <option value="call">Ligação</option>
                  <option value="email">E-mail</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </label>

              <label>
                Próximo contato

                <input
                  type="date"
                  min={today}
                  value={nextContactDate}
                  onChange={(event) =>
                    setNextContactDate(event.target.value)
                  }
                />
              </label>
            </div>

            <label>
              Observações

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="Ex.: Cliente relatou dificuldades no uso da funcionalidade..."
                rows={4}
                required
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Salvar acompanhamento
              </button>
            </div>
          </form>
        )}

        <section className="follow-up-history">
          <div className="history-title">
            <History size={18} />

            <div>
              <h3>Histórico de acompanhamentos</h3>

              <span>
                {followUps.length} registro
                {followUps.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {followUps.length === 0 ? (
            <div className="history-empty">
              Nenhum acompanhamento registrado para este cliente.
            </div>
          ) : (
            <div className="history-list">
              {followUps.map((followUp) => (
                <article
                  key={followUp.id}
                  className="history-item"
                >
                  <div className="history-item-header">
                    <strong>
                      {contactTypeLabels[followUp.contactType]}
                    </strong>

                    <div className="history-item-actions">
                      <span>
                        {formatDateTime(followUp.createdAt)}
                      </span>

                      <button
                        type="button"
                        className="delete-history-button"
                        onClick={() =>
                          handleDeleteFollowUp(followUp.id)
                        }
                        aria-label="Excluir acompanhamento"
                        title="Excluir acompanhamento"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p>{followUp.notes}</p>

                  <div className="next-contact">
                    <Clock3 size={14} />

                    Próximo contato:{" "}
                    {formatDate(followUp.nextContactDate)}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="modal-footer">
          <button type="button" onClick={onClose}>
            Fechar
          </button>

          {!showForm && (
            <button
              type="button"
              className="primary-button"
              onClick={() => setShowForm(true)}
            >
              Registrar acompanhamento
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}