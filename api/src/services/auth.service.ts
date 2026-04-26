import { randomInt } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../lib/app-error.js";
import type { AuthUserPayload } from "../lib/jwt.js";
import { signAccessToken, verifyAccessToken } from "../lib/jwt.js";
import { hashRefreshToken, newRefreshTokenRaw } from "../lib/refresh-crypto.js";
import { hashEmailCode, hashPassword, verifyEmailCode, verifyPassword } from "../lib/password.js";
import type { RegisterBody } from "../schemas/auth.zod.js";
import { UserRepository } from "../repositories/user.repository.js";
import { RefreshSessionRepository } from "../repositories/refresh-session.repository.js";
import { env } from "../config/env.js";

const VERIFICATION_TTL_MS = 60 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildUserPayload(row: { id: number; email: string; fullName: string; emailVerified: boolean }): AuthUserPayload {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    emailVerified: row.emailVerified,
  };
}

function cookieOpts(): { path: "/" ; httpOnly: true; sameSite: "lax"; secure: boolean } {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
  };
}

function setAccessCookie(reply: FastifyReply, token: string): void {
  reply.setCookie(env.accessTokenCookieName, token, {
    ...cookieOpts(),
    maxAge: env.accessTokenTtlSec,
  });
}

function setRefreshCookie(reply: FastifyReply, rawToken: string): void {
  reply.setCookie(env.refreshTokenCookieName, rawToken, {
    ...cookieOpts(),
    maxAge: env.refreshTokenTtlDays * 86400,
  });
}

function clearAuthCookies(reply: FastifyReply): void {
  reply.clearCookie(env.accessTokenCookieName, { path: "/" });
  reply.clearCookie(env.refreshTokenCookieName, { path: "/" });
}

function refreshExpiresAt(): Date {
  return new Date(Date.now() + env.refreshTokenTtlDays * 86400 * 1000);
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshSessions: RefreshSessionRepository
  ) {}

  async attachUserToRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const access = request.cookies[env.accessTokenCookieName];
    if (access) {
      try {
        request.user = verifyAccessToken(access);
        return;
      } catch {
        // пробуем обновить по refresh
      }
    }
    const refresh = request.cookies[env.refreshTokenCookieName];
    if (!refresh) return;
    const user = await this.rotateRefreshSession(refresh, reply);
    if (user) request.user = user;
  }

  /** Ротация refresh и выдача новой пары cookie; null если refresh недействителен */
  async rotateRefreshSession(refreshRaw: string, reply: FastifyReply): Promise<AuthUserPayload | null> {
    const oldHash = hashRefreshToken(refreshRaw);
    const newRaw = newRefreshTokenRaw();
    const newHash = hashRefreshToken(newRaw);
    const newExpires = refreshExpiresAt();
    const rotated = await this.refreshSessions.rotate(oldHash, newHash, newExpires);
    if (!rotated) return null;
    const user = await this.users.findById(rotated.userId);
    if (!user) return null;
    const payload = buildUserPayload(user);
    setAccessCookie(reply, signAccessToken(payload));
    setRefreshCookie(reply, newRaw);
    return payload;
  }

  async explicitRefresh(request: FastifyRequest, reply: FastifyReply): Promise<{ ok: true }> {
    const access = request.cookies[env.accessTokenCookieName];
    if (access) {
      try {
        verifyAccessToken(access);
        return { ok: true };
      } catch {
        // access просрочен — обновляем по refresh
      }
    }
    const refresh = request.cookies[env.refreshTokenCookieName];
    if (!refresh) {
      throw new AppError(401, "Нет действующей сессии", "no_refresh");
    }
    const u = await this.rotateRefreshSession(refresh, reply);
    if (!u) {
      clearAuthCookies(reply);
      throw new AppError(401, "Сессия недействительна", "invalid_refresh");
    }
    return { ok: true };
  }

  async register(body: RegisterBody): Promise<{ mockEmailCode: string }> {
    const email = normalizeEmail(body.email);
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new AppError(409, "Пользователь с такой почтой уже зарегистрирован", "email_taken");
    }
    const passwordHash = await hashPassword(body.password);
    const mockEmailCode = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const codeHash = await hashEmailCode(mockEmailCode);
    const expires = new Date(Date.now() + VERIFICATION_TTL_MS);
    await this.users.create({
      email,
      passwordHash,
      fullName: body.fullName.trim(),
      emailVerified: false,
      emailVerificationCodeHash: codeHash,
      emailVerificationExpiresAt: expires,
    });
    return { mockEmailCode };
  }

  async verifyEmail(emailRaw: string, code: string): Promise<void> {
    const email = normalizeEmail(emailRaw);
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new AppError(404, "Пользователь не найден", "not_found");
    }
    if (user.emailVerified) {
      return;
    }
    if (!user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) {
      throw new AppError(400, "Код подтверждения не запрошен", "no_code");
    }
    if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
      throw new AppError(400, "Срок действия кода истёк", "code_expired");
    }
    const ok = await verifyEmailCode(code.trim(), user.emailVerificationCodeHash);
    if (!ok) {
      throw new AppError(400, "Неверный код подтверждения", "bad_code");
    }
    await this.users.updateVerificationState(user.id, {
      emailVerified: true,
      emailVerificationCodeHash: null,
      emailVerificationExpiresAt: null,
    });
  }

  async login(emailRaw: string, password: string, reply: FastifyReply): Promise<AuthUserPayload> {
    const email = normalizeEmail(emailRaw);
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new AppError(401, "Неверная почта или пароль", "bad_credentials");
    }
    const match = await verifyPassword(password, user.passwordHash);
    if (!match) {
      throw new AppError(401, "Неверная почта или пароль", "bad_credentials");
    }
    if (!user.emailVerified) {
      throw new AppError(403, "Сначала подтвердите адрес электронной почты", "email_not_verified");
    }
    const payload = buildUserPayload(user);
    const raw = newRefreshTokenRaw();
    const hash = hashRefreshToken(raw);
    await this.refreshSessions.create(user.id, hash, refreshExpiresAt());
    setAccessCookie(reply, signAccessToken(payload));
    setRefreshCookie(reply, raw);
    return payload;
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    let userId: number | null = null;
    const access = request.cookies[env.accessTokenCookieName];
    if (access) {
      try {
        userId = verifyAccessToken(access).id;
      } catch {
        // ignore
      }
    }
    if (userId == null) {
      const refresh = request.cookies[env.refreshTokenCookieName];
      if (refresh) {
        const row = await this.refreshSessions.findByTokenHash(hashRefreshToken(refresh));
        if (row) userId = row.userId;
      }
    }
    if (userId != null) {
      await this.refreshSessions.deleteAllForUser(userId);
    }
    clearAuthCookies(reply);
  }

  async me(userId: number): Promise<AuthUserPayload> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new AppError(401, "Сессия недействительна", "invalid_session");
    }
    return buildUserPayload(user);
  }
}
