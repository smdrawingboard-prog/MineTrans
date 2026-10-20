import { beforeEach, describe, expect, it } from "vitest";
import type { Request, Response } from "express";
import {
  ADMIN_COOKIE,
  adminLoginHandler,
  adminLogoutHandler,
  adminSessionHandler,
  readAdminSession,
  resetLoginAttempts,
  safeEqual,
} from "./_core/adminSession";

type MockRes = Response & { statusCode: number; body: any; headers: Record<string, string> };

function mockRes(): MockRes {
  const res: any = { statusCode: 200, body: undefined, headers: {} };
  res.status = (code: number) => ((res.statusCode = code), res);
  res.json = (b: unknown) => ((res.body = b), res);
  res.setHeader = (k: string, v: string) => ((res.headers[k.toLowerCase()] = v), res);
  res.set = (k: string, v: string) => ((res.headers[k.toLowerCase()] = v), res);
  return res;
}

function mockReq(body: unknown = {}, cookie?: string, ip = "10.0.0.1"): Request {
  return { body, headers: cookie ? { cookie } : {}, socket: { remoteAddress: ip } } as unknown as Request;
}

function cookieFrom(res: MockRes): string {
  return res.headers["set-cookie"].split(";")[0];
}

const TEST_PASSWORD = "correct horse battery staple";

beforeEach(() => {
  resetLoginAttempts();
  process.env.ADMIN_PASSWORD = TEST_PASSWORD;
  process.env.ADMIN_SESSION_SECRET = "x".repeat(40);
  delete process.env.ADMIN_USERNAME;
});

describe("admin session", () => {
  it("logs in with the configured credentials and sets an HttpOnly cookie", async () => {
    const res = mockRes();
    await adminLoginHandler(mockReq({ username: "admin", password: TEST_PASSWORD }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(res.headers["set-cookie"]).toMatch(new RegExp(`^${ADMIN_COOKIE}=`));
    expect(res.headers["set-cookie"]).toMatch(/HttpOnly/i);
    expect(res.headers["set-cookie"]).toMatch(/SameSite=Strict/i);
  });

  it("accepts the issued cookie and reports the session as authenticated", async () => {
    const login = mockRes();
    await adminLoginHandler(mockReq({ username: "admin", password: TEST_PASSWORD }), login);
    const cookie = cookieFrom(login);
    expect(await readAdminSession(mockReq({}, cookie))).toBe("admin");

    const session = mockRes();
    await adminSessionHandler(mockReq({}, cookie), session);
    expect(session.body).toEqual({ authenticated: true, username: "admin" });
  });

  it("rejects a wrong password, wrong username, and missing fields", async () => {
    for (const body of [
      { username: "admin", password: "wrong" },
      { username: "root", password: TEST_PASSWORD },
      {},
      { username: 123, password: null },
    ]) {
      const res = mockRes();
      await adminLoginHandler(mockReq(body), res);
      expect(res.statusCode).toBe(401);
      expect(res.headers["set-cookie"]).toBeUndefined();
    }
  });

  it("no longer accepts the old hard-coded password", async () => {
    const res = mockRes();
    await adminLoginHandler(mockReq({ username: "admin", password: "Roger@daginsure" }), res);
    expect(res.statusCode).toBe(401);
  });

  it("disables login when the password or secret is not configured", async () => {
    delete process.env.ADMIN_PASSWORD;
    const res = mockRes();
    await adminLoginHandler(mockReq({ username: "admin", password: "" }), res);
    expect(res.statusCode).toBe(503);

    process.env.ADMIN_PASSWORD = TEST_PASSWORD;
    process.env.ADMIN_SESSION_SECRET = "too-short";
    const res2 = mockRes();
    await adminLoginHandler(mockReq({ username: "admin", password: TEST_PASSWORD }), res2);
    expect(res2.statusCode).toBe(503);
  });

  it("rejects tampered, foreign-secret, and missing cookies", async () => {
    const login = mockRes();
    await adminLoginHandler(mockReq({ username: "admin", password: TEST_PASSWORD }), login);
    const cookie = cookieFrom(login);

    expect(await readAdminSession(mockReq({}, cookie.slice(0, -3) + "abc"))).toBeNull();
    expect(await readAdminSession(mockReq({}))).toBeNull();
    expect(await readAdminSession(mockReq({}, "other=1"))).toBeNull();

    process.env.ADMIN_SESSION_SECRET = "y".repeat(40);
    expect(await readAdminSession(mockReq({}, cookie))).toBeNull();

    const session = mockRes();
    await adminSessionHandler(mockReq({}, cookie), session);
    expect(session.statusCode).toBe(401);
  });

  it("still allows login after 9 failed attempts (one below the limit)", async () => {
    for (let i = 0; i < 9; i++) {
      await adminLoginHandler(mockReq({ username: "admin", password: "nope" }, undefined, "9.9.9.9"), mockRes());
    }
    const res = mockRes();
    await adminLoginHandler(mockReq({ username: "admin", password: TEST_PASSWORD }, undefined, "9.9.9.9"), res);
    expect(res.statusCode).toBe(200);
  });

  it("locks out an IP after 10 failed attempts", async () => {
    for (let i = 0; i < 10; i++) {
      await adminLoginHandler(mockReq({ username: "admin", password: "nope" }, undefined, "1.2.3.4"), mockRes());
    }
    const blocked = mockRes();
    await adminLoginHandler(mockReq({ username: "admin", password: TEST_PASSWORD }, undefined, "1.2.3.4"), blocked);
    expect(blocked.statusCode).toBe(429);

    const otherIp = mockRes();
    await adminLoginHandler(mockReq({ username: "admin", password: TEST_PASSWORD }, undefined, "5.6.7.8"), otherIp);
    expect(otherIp.statusCode).toBe(200);
  });

  it("logout clears the cookie", () => {
    const res = mockRes();
    adminLogoutHandler(mockReq(), res);
    expect(res.headers["set-cookie"]).toMatch(/Max-Age=0/i);
  });

  it("compares strings safely regardless of length", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
  });
});
