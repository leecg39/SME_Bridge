import type { ConsultationPayload, ConsultationRecord } from "./consultation";
import type { MnaRoadmapPhase } from "./mna-documents";
import type { ValuationResult } from "./valuation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof body?.detail === "string"
        ? body.detail
        : typeof body?.error === "string"
          ? body.error
          : `요청에 실패했습니다. (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

export function createConsultation(
  payload: ConsultationPayload,
): Promise<ConsultationRecord> {
  return request<ConsultationRecord>("/api/v1/consultations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listConsultations(): Promise<ConsultationRecord[]> {
  return request<ConsultationRecord[]>("/api/v1/consultations");
}

export function getMnaDocuments(): Promise<MnaRoadmapPhase[]> {
  return request<MnaRoadmapPhase[]>("/api/v1/mna-documents");
}

export function getValuationProgress(): Promise<{ result: ValuationResult | null }> {
  return request<{ result: ValuationResult | null }>("/api/v1/valuation-progress");
}
