declare global { interface Window { __env?: Record<string, string>; } }
export function loadEnv(): () => Promise<void> {
  return async () => {
    try {
      const res = await fetch('/.env', { cache: 'no-cache' });
      if (!res.ok) return;
      const text = await res.text();
      const lines = text.split(/\r?\n/);
      const obj: Record<string,string> = {};
      for (const line of lines) {
        const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
        if (!m) continue;
        let v = m[2];
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        obj[m[1]] = v;
      }
      window.__env = obj;
    } catch {}
  };
}
export function apiBase(): string {
  const v = window.__env && window.__env['API_BASE_URL'];
  return v && v.trim() ? v.trim() : 'http://localhost:8080/api';
}
