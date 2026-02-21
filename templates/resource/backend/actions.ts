// server/actions/__resource__Actions.ts
import type { TRPCContext } from "../api/trpc";
import type {
  __resource__CreateInput,
  __resource__UpdateInput,
} from "../../shared/types/__resource__";

export const __resource__Actions = {
  async list(ctx: TRPCContext, args: { userId: string }) {
    // DB reads/writes live here
    return ctx.db.__resource__.findMany({
      where: { userId: args.userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(ctx: TRPCContext, args: { userId: string; id: string }) {
    return ctx.db.__resource__.findFirstOrThrow({
      where: { id: args.id, userId: args.userId },
    });
  },

  async create(
    ctx: TRPCContext,
    args: { userId: string; input: __resource__CreateInput }
  ) {
    return ctx.db.__resource__.create({
      data: { ...args.input, userId: args.userId },
    });
  },

  async update(
    ctx: TRPCContext,
    args: { userId: string; input: __resource__UpdateInput }
  ) {
    const { id, ...patch } = args.input;
    return ctx.db.__resource__.update({
      where: { id, userId: args.userId },
      data: patch,
    });
  },

  async delete(ctx: TRPCContext, args: { userId: string; id: string }) {
    return ctx.db.__resource__.delete({
      where: { id: args.id, userId: args.userId },
    });
  },
};
