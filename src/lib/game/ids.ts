let counter = 0;

function randomHex(len: number): string {
  const bytes = new Uint8Array(len);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < len; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateId(prefix = "id"): string {
  counter = (counter + 1) % 1_000_000;
  return `${prefix}_${randomHex(6)}_${counter}`;
}

export function generateGameId(): string {
  return generateId("game");
}

export function generatePlayerId(): string {
  return generateId("player");
}

export function generateCardDefId(): string {
  return generateId("def");
}

export function generateCardInstanceId(): string {
  return generateId("inst");
}

export function generateLogId(): string {
  return generateId("log");
}
