type Json = Record<string, unknown>;

const BASE_URL = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

function isoAfter(minutesFromNow: number) {
  return new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString();
}

async function requestJson(
  path: string,
  init: RequestInit = {},
  cookie?: string
): Promise<{ ok: boolean; status: number; data: Json; setCookie?: string }> {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (cookie) headers.set("Cookie", cookie);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const setCookie = res.headers.get("set-cookie") ?? undefined;
  const data = (await res.json().catch(() => ({}))) as Json;
  return { ok: res.ok, status: res.status, data, setCookie };
}

async function main() {
  console.log(`Smoke test base URL: ${BASE_URL}`);

  const login = await requestJson("/api/auth/demo", {
    method: "POST",
    body: JSON.stringify({ email: "test@user.com", password: "12345678" }),
  });

  if (!login.ok || !login.setCookie) {
    throw new Error(`Login failed (${login.status}). Ensure dev server + demo user are ready.`);
  }

  const cookie = login.setCookie.split(";")[0];
  const title = `Smoke ${Date.now()}`;

  const create = await requestJson(
    "/api/appointments",
    {
      method: "POST",
      body: JSON.stringify({
        title,
        start: isoAfter(30),
        end: isoAfter(90),
        location: "Smoke Route",
        notes: "Smoke invalidation",
        status: "pending",
        patient: null,
        category: null,
        attachements: [],
      }),
    },
    cookie
  );

  if (!create.ok || !create.data.appointment) {
    throw new Error(`Create failed (${create.status}).`);
  }

  const created = create.data.appointment as { id: string; title: string; status?: string };
  const id = created.id;

  const listAfterCreate = await requestJson("/api/appointments", { method: "GET" }, cookie);
  const rowsAfterCreate = (listAfterCreate.data.appointments ?? []) as Array<{ id: string }>;
  if (!rowsAfterCreate.some((a) => a.id === id)) {
    throw new Error("Created appointment not found in list.");
  }

  const update = await requestJson(
    `/api/appointments/${id}`,
    { method: "PATCH", body: JSON.stringify({ status: "done" }) },
    cookie
  );
  if (!update.ok) {
    throw new Error(`Update failed (${update.status}).`);
  }

  const detailAfterUpdate = await requestJson(`/api/appointments/${id}`, { method: "GET" }, cookie);
  const status = ((detailAfterUpdate.data.appointment as Json | undefined)?.status as string | undefined) ?? "";
  if (status !== "done") {
    throw new Error("Updated status not reflected in detail endpoint.");
  }

  for (const view of ["list", "day", "week", "month"]) {
    const pageRes = await fetch(`${BASE_URL}/dashboard?view=${view}`, {
      headers: { Cookie: cookie },
    });
    if (!pageRes.ok) {
      throw new Error(`Dashboard view "${view}" failed with ${pageRes.status}.`);
    }
  }

  const del = await requestJson(`/api/appointments/${id}`, { method: "DELETE" }, cookie);
  if (!del.ok) {
    throw new Error(`Delete failed (${del.status}).`);
  }

  const listAfterDelete = await requestJson("/api/appointments", { method: "GET" }, cookie);
  const rowsAfterDelete = (listAfterDelete.data.appointments ?? []) as Array<{ id: string }>;
  if (rowsAfterDelete.some((a) => a.id === id)) {
    throw new Error("Deleted appointment still present.");
  }

  console.log("Smoke CRUD/invalidation flow: PASS");
}

main().catch((error) => {
  console.error("Smoke CRUD/invalidation flow: FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

