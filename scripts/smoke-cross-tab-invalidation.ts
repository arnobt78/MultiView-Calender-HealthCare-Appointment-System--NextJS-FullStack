/**
 * HTTP smoke: create appointment → PATCH → DELETE while asserting API list/detail consistency.
 * Also GET /api/insights before/after CRUD (API-level insights bust; TanStack bust covered by unit test).
 * Requires a running Next dev server and seeded demo users (`npm run db:seed-test-user`).
 * Complements `npm run test` (Vitest unit) — not a substitute for full browser QA (portal book, assignees, activities).
 */
import {
  DEMO_DOCTOR_APPOINTMENT_TYPE_ID,
  DEMO_DOCTOR_EMAIL,
  DEMO_PASSWORD,
  DEMO_PATIENT_EMAIL,
  DEMO_SMOKE_EMAIL,
} from "../src/lib/demo-credentials";

type Json = Record<string, unknown>;

const BASE_URL = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

function isoAfter(minutesFromNow: number) {
  return new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString();
}

function isoDateToday() {
  return new Date().toISOString().slice(0, 10);
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

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function loginWithRetry(email: string, password: string, attempts = 5) {
  let lastStatus = 0;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      const login = await requestJson("/api/auth/demo", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      lastStatus = login.status;
      if (login.ok && login.setCookie) return login;
    } catch {
      // retry path for transient startup/fetch issues
    }
    await sleep(250 * i);
  }
  throw new Error(`Login failed (${lastStatus || "fetch-failed"}). Ensure dev server + demo users are ready.`);
}

async function main() {
  console.log(`Smoke test base URL: ${BASE_URL}`);

  const login = await loginWithRetry(DEMO_SMOKE_EMAIL, DEMO_PASSWORD);

  const cookie = (login.setCookie ?? "").split(";")[0];
  if (!cookie) {
    throw new Error("Login missing auth cookie.");
  }
  const title = `Smoke ${Date.now()}`;

  const insightsBefore = await requestJson(
    "/api/insights?scope=personal&period=month",
    { method: "GET" },
    cookie
  );
  if (!insightsBefore.ok) {
    throw new Error(`Insights before create failed (${insightsBefore.status}).`);
  }
  const totalBefore =
    ((insightsBefore.data.overview as { total?: number } | undefined)?.total as number | undefined) ??
    0;

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
        attachments: [],
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

  const insightsAfter = await requestJson(
    "/api/insights?scope=personal&period=month",
    { method: "GET" },
    cookie
  );
  if (!insightsAfter.ok) {
    throw new Error(`Insights after delete failed (${insightsAfter.status}).`);
  }
  const totalAfter =
    ((insightsAfter.data.overview as { total?: number } | undefined)?.total as number | undefined) ??
    0;
  if (totalAfter !== totalBefore) {
    throw new Error(
      `Insights total did not restore after delete (before=${totalBefore}, after=${totalAfter}).`
    );
  }

  const listAfterDelete = await requestJson("/api/appointments", { method: "GET" }, cookie);
  const rowsAfterDelete = (listAfterDelete.data.appointments ?? []) as Array<{ id: string }>;
  if (rowsAfterDelete.some((a) => a.id === id)) {
    throw new Error("Deleted appointment still present.");
  }

  // Doctor scenario: slots endpoint should return successfully.
  const doctorLogin = await loginWithRetry(DEMO_DOCTOR_EMAIL, DEMO_PASSWORD);
  const doctorCookie = (doctorLogin.setCookie ?? "").split(";")[0];
  if (!doctorCookie) {
    throw new Error("Doctor login missing auth cookie.");
  }
  const doctorUser = doctorLogin.data.user as { id?: string } | undefined;
  const doctorId = doctorUser?.id;
  if (!doctorId) {
    throw new Error("Doctor login missing user.id");
  }
  const slots = await requestJson(
    `/api/availability/slots?doctorId=${doctorId}&date=${isoDateToday()}&typeId=${DEMO_DOCTOR_APPOINTMENT_TYPE_ID}`,
    { method: "GET" },
    doctorCookie
  );
  if (!slots.ok) {
    throw new Error(`Availability slots failed (${slots.status}).`);
  }
  if (!Array.isArray((slots.data as { slots?: unknown[] }).slots)) {
    throw new Error("Availability slots payload invalid.");
  }

  // Patient scenario: dashboard appointment create should be blocked by RBAC.
  const patientLogin = await loginWithRetry(DEMO_PATIENT_EMAIL, DEMO_PASSWORD);
  const patientCookie = (patientLogin.setCookie ?? "").split(";")[0];
  if (!patientCookie) {
    throw new Error("Patient login missing auth cookie.");
  }
  const patientCreate = await requestJson(
    "/api/appointments",
    {
      method: "POST",
      body: JSON.stringify({
        title: `Patient blocked ${Date.now()}`,
        start: isoAfter(45),
        end: isoAfter(75),
        location: "RBAC Smoke",
        notes: "Should be forbidden",
        status: "pending",
        patient: null,
        category: null,
        attachments: [],
      }),
    },
    patientCookie
  );
  if (patientCreate.status !== 403) {
    throw new Error(`Patient RBAC expected 403, got ${patientCreate.status}.`);
  }

  console.log("Smoke CRUD/invalidation flow: PASS");
}

main().catch((error) => {
  console.error("Smoke CRUD/invalidation flow: FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

