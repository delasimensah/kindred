import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

import type { DataModel } from "./_generated/dataModel";
import { requirePassword } from "./lib/accountPassword";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      validatePasswordRequirements: (password: string) => {
        requirePassword(password);
      },
      profile: (params) => {
        const email = params.email;
        if (typeof email !== "string" || email.length === 0) {
          throw new ConvexError("Email is required");
        }
        const name = typeof params.name === "string" ? params.name.trim() : "";
        if (name.length > 0) {
          return { email, name };
        }
        return { email };
      },
    }),
  ],
});
