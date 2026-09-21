import {
  createAccount,
  modifyAccountCredentials,
} from "@convex-dev/auth/server";
import type { GenericActionCtx } from "convex/server";

import type { DataModel } from "../_generated/dataModel";
import { ERROR_CODES, raise } from "./errors";

const MIN_PASSWORD_LENGTH = 8;

export function requirePassword(password: string): string {
  if (password.length < MIN_PASSWORD_LENGTH) {
    raise(
      ERROR_CODES.INVALID,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    );
  }
  return password;
}

export async function setAccountPassword(
  ctx: GenericActionCtx<DataModel>,
  email: string,
  password: string
): Promise<void> {
  try {
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: email, secret: password },
    });
  } catch {
    await createAccount(ctx, {
      provider: "password",
      account: { id: email, secret: password },
      profile: { email },
    });
  }
}
