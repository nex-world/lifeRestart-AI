import { appVersion, analyticsApiUrl } from "@src/--CONFIGS";
import type { AchievementData } from "@lib/life-restart/achievement";
import type { GameMode, SupplierForm } from "@views/appViews/game/types";

const PLATFORM_UUID_KEY = "__NexWorld_UUID__";
const LEGACY_TAVERN_UUID_KEY = "__NexTavern_UUID__";
const CLARITY_ID_PATTERN = /^[a-z0-9_-]{1,100}$/i;

type AiOperationMetadata = {
  supplierType: "builtin" | "custom";
  supplierId: string;
  modelId: string;
};

type AnalyticsEvent =
  | { eventType: "game.mode.selected"; metadata: { mode: GameMode } }
  | {
      eventType: "achievement.unlocked";
      metadata: {
        achievementId: string;
        grade: number;
        opportunity: string;
        visibility: "visible" | "hidden";
      };
    }
  | { eventType: "ai.operation.succeeded"; metadata: AiOperationMetadata }
  | {
      eventType: "ai.operation.failed";
      metadata: AiOperationMetadata & { failureType: AiFailureType };
    };

export type AiFailureType =
  | "network"
  | "authentication"
  | "rate-limit"
  | "provider"
  | "invalid-response"
  | "unknown";

function runTelemetrySafely(operation: () => unknown) {
  try {
    const result = operation();
    if (result && typeof (result as PromiseLike<unknown>).then === "function") {
      void Promise.resolve(result).catch(() => undefined);
    }
  } catch {
    // Analytics must never affect gameplay.
  }
}

function getNexWorldUUID() {
  const existing =
    localStorage.getItem(PLATFORM_UUID_KEY) ||
    localStorage.getItem(LEGACY_TAVERN_UUID_KEY);
  const uuid =
    existing ||
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(PLATFORM_UUID_KEY, uuid);
  localStorage.setItem(LEGACY_TAVERN_UUID_KEY, uuid);
  return uuid;
}

function getClarityUserId() {
  const encodedCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("_clck="))
    ?.slice("_clck=".length);
  if (!encodedCookie) return undefined;

  try {
    const clarityUserId = decodeURIComponent(encodedCookie)
      .split(/[\^|]/, 1)[0]
      ?.trim();
    return clarityUserId && CLARITY_ID_PATTERN.test(clarityUserId)
      ? clarityUserId
      : undefined;
  } catch {
    return undefined;
  }
}

function makeEventId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function trackAnalyticsEvent(event: AnalyticsEvent) {
  runTelemetrySafely(() => {
    if (!analyticsApiUrl) return;
    void fetch(`${analyticsApiUrl.replace(/\/$/, "")}/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...event,
        eventId: makeEventId(),
        productId: "life-restart-ai",
        uuid: getNexWorldUUID(),
        clarityUserId: getClarityUserId(),
        appVersion,
      }),
      keepalive: true,
    }).catch(() => undefined);
  });
}

export function trackAchievementUnlocked(achievement: AchievementData) {
  trackAnalyticsEvent({
    eventType: "achievement.unlocked",
    metadata: {
      achievementId: String(achievement.id),
      grade: Number(achievement.grade),
      opportunity: String(achievement.opportunity),
      visibility: achievement.hide ? "hidden" : "visible",
    },
  });
}

export function getAiOperationMetadata(
  form: SupplierForm,
  customSupplierNames: readonly string[],
): AiOperationMetadata {
  const supplierName = form.selectedSupplier?.name?.trim() || "unknown";
  const selectedModel = form.selectedModelDict?.[supplierName];
  const selectedModelName =
    selectedModel?.name && selectedModel.name !== "[[<DEFAULT>]]"
      ? selectedModel.name
      : undefined;
  const modelId =
    String(selectedModelName ?? form.selectedSupplier?.defaultModel ?? "").trim() ||
    "default";
  const isCustom = customSupplierNames.includes(supplierName);
  return {
    supplierType: isCustom ? "custom" : "builtin",
    supplierId: isCustom ? "custom" : supplierName,
    modelId,
  };
}

export function classifyAiFailure(error: unknown): AiFailureType {
  if (error instanceof SyntaxError) return "invalid-response";
  if (!error || typeof error !== "object") return "unknown";

  const candidate = error as {
    status?: unknown;
    code?: unknown;
    name?: unknown;
    message?: unknown;
  };
  const status = Number(candidate.status);
  if (status === 401 || status === 403) return "authentication";
  if (status === 429) return "rate-limit";
  if (Number.isFinite(status) && status >= 400) return "provider";

  const signature = `${candidate.name ?? ""} ${candidate.code ?? ""} ${candidate.message ?? ""}`.toLowerCase();
  if (/network|fetch|timeout|timedout|econn|enotfound|abort/.test(signature)) {
    return "network";
  }
  if (/json|parse|response/.test(signature)) return "invalid-response";
  return "unknown";
}
