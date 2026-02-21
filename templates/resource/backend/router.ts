// server/api/routers/__resource__.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { __Resource__Service } from "../../services/__Resource__Service";
import {
  __resource__CreateInputSchema,
  __resource__UpdateInputSchema,
  __resource__IdSchema,
} from "../../../shared/schemas/__resource__";

export const __resource__Router = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      const service = new __Resource__Service(ctx);
      return service.list({ userId: ctx.session.user.id });
    }),

  getById: protectedProcedure
    .input(__resource__IdSchema)
    .query(async ({ ctx, input }) => {
      const service = new __Resource__Service(ctx);
      return service.getById({ userId: ctx.session.user.id, id: input.id });
    }),

  create: protectedProcedure
    .input(__resource__CreateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new __Resource__Service(ctx);
      return service.create({ userId: ctx.session.user.id, input });
    }),

  update: protectedProcedure
    .input(__resource__UpdateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new __Resource__Service(ctx);
      return service.update({ userId: ctx.session.user.id, input });
    }),

  delete: protectedProcedure
    .input(__resource__IdSchema)
    .mutation(async ({ ctx, input }) => {
      const service = new __Resource__Service(ctx);
      return service.delete({ userId: ctx.session.user.id, id: input.id });
    }),
});
