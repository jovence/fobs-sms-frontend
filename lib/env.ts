export function requiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function requiredBooleanEnv(name: string, value: string | undefined): boolean {
  const raw = requiredEnv(name, value);

  if (raw === "true") return true;
  if (raw === "false") return false;

  throw new Error(`Environment variable ${name} must be "true" or "false".`);
}
