type ParsedJwtPayload = {
  iss?: string;
};

function parseProjectRefFromUrl(value: string) {
  try {
    const host = new URL(value).host;
    const [ref] = host.split(".");
    return ref || null;
  } catch {
    return null;
  }
}

function parseJwtPayload(token: string): ParsedJwtPayload | null {
  const segments = token.split(".");
  if (segments.length < 2) {
    return null;
  }

  try {
    const payload = Buffer.from(segments[1], "base64url").toString("utf8");
    return JSON.parse(payload) as ParsedJwtPayload;
  } catch {
    return null;
  }
}

function parseProjectRefFromJwt(token: string) {
  const payload = parseJwtPayload(token);
  if (!payload?.iss) {
    return null;
  }

  return parseProjectRefFromUrl(payload.iss);
}

function maskSecret(value: string) {
  if (!value) {
    return "missing";
  }

  if (value.length <= 12) {
    return `${value.slice(0, 3)}...`;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function getSupabaseEnvDiagnostics() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const urlProjectRef = parseProjectRefFromUrl(url);
  const anonProjectRef = parseProjectRefFromJwt(anonKey);
  const serviceProjectRef = parseProjectRefFromJwt(serviceRoleKey);

  const refs = [urlProjectRef, anonProjectRef, serviceProjectRef].filter(
    (value): value is string => Boolean(value)
  );

  return {
    urlHost: url ? new URL(url).host : "missing",
    urlProjectRef,
    anonProjectRef,
    serviceProjectRef,
    maskedAnonKey: maskSecret(anonKey),
    maskedServiceRoleKey: maskSecret(serviceRoleKey),
    hasAllValues: Boolean(url && anonKey && serviceRoleKey),
    refsMatch: refs.length > 0 && new Set(refs).size === 1
  };
}
