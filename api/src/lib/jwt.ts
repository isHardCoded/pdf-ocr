import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type AuthUserPayload = {
  id: number;
  email: string;
  fullName: string;
  emailVerified: boolean;
};

type JwtClaims = {
  sub: number;
  email: string;
  fn: string;
  ev: boolean;
  typ: "access";
};

export function signAccessToken(user: AuthUserPayload): string {
  const claims: JwtClaims = {
    sub: user.id,
    email: user.email,
    fn: user.fullName,
    ev: user.emailVerified,
    typ: "access",
  };
  return jwt.sign(claims, env.jwtSecret, { algorithm: "HS256", expiresIn: env.accessTokenTtlSec });
}

export function verifyAccessToken(token: string): AuthUserPayload {
  const decoded = jwt.verify(token, env.jwtSecret) as unknown as JwtClaims & { typ?: string };
  if (typeof decoded.sub !== "number" || !decoded.email) {
    throw new Error("invalid_token");
  }
  if (decoded.typ != null && decoded.typ !== "access") {
    throw new Error("invalid_token");
  }
  return {
    id: decoded.sub,
    email: decoded.email,
    fullName: decoded.fn ?? "",
    emailVerified: Boolean(decoded.ev),
  };
}
