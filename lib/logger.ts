// Lightweight logger that preserves debug info without using console.*
// - Client: stores logs in localStorage and emits a window event for dev overlays
// - Server: stores logs in a global ring buffer (best-effort, ephemeral)

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  id: string;
  level: LogLevel;
  message: string;
  context?: unknown;
  timestamp: number; // ms epoch
};

const MAX_ENTRIES = 200;

function genId(): string {
  // No crypto dependency; good enough for debug identifiers
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function toSerializable(value: unknown): unknown {
  // Avoid non-serializable structures blowing up localStorage
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  try {
    JSON.stringify(value);
    return value;
  } catch {
    return String(value);
  }
}

function writeClient(entry: LogEntry) {
  try {
    const key = "doable:logs";
    const raw = window.localStorage.getItem(key);
    const arr: LogEntry[] = raw ? (JSON.parse(raw) as LogEntry[]) : [];
    arr.push({ ...entry, context: toSerializable(entry.context) });
    if (arr.length > MAX_ENTRIES) {
      arr.splice(0, arr.length - MAX_ENTRIES);
    }
    window.localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    // Swallow; logging must be non-fatal
  }

  try {
    const ev = new CustomEvent<LogEntry>("doable:log", { detail: entry });
    window.dispatchEvent(ev);
  } catch {
    // ignore
  }
}

function writeServer(entry: LogEntry) {
  const g = globalThis as unknown as { __DOABLE_SERVER_LOGS?: LogEntry[] };
  if (!g.__DOABLE_SERVER_LOGS) {
    g.__DOABLE_SERVER_LOGS = [];
  }
  const buf = g.__DOABLE_SERVER_LOGS;
  buf.push({ ...entry, context: toSerializable(entry.context) });
  if (buf.length > MAX_ENTRIES) {
    buf.splice(0, buf.length - MAX_ENTRIES);
  }
}

function write(entry: LogEntry) {
  if (typeof window !== "undefined") {
    writeClient(entry);
  } else {
    writeServer(entry);
  }
}

function log(level: LogLevel, message: string, context?: unknown): string {
  const id = genId();
  write({ id, level, message, context, timestamp: Date.now() });
  return id; // return a debug id to attach to responses/UI
}

export const logger = {
  debug: (message: string, context?: unknown) => log("debug", message, context),
  info: (message: string, context?: unknown) => log("info", message, context),
  warn: (message: string, context?: unknown) => log("warn", message, context),
  error: (message: string, context?: unknown) => log("error", message, context),
};
