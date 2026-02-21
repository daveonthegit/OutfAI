// server/services/__Resource__Service.ts
import type { TRPCContext } from "../api/trpc";
import type {
  __resource__CreateInput,
  __resource__UpdateInput,
} from "../../shared/types/__resource__";
import { __resource__Actions } from "../actions/__resource__Actions";

export class __Resource__Service {
  constructor(private ctx: TRPCContext) {}

  // Orchestrates workflows ONLY. No direct DB calls here.
  async list(args: { userId: string }) {
    return __resource__Actions.list(this.ctx, args);
  }

  async getById(args: { userId: string; id: string }) {
    return __resource__Actions.getById(this.ctx, args);
  }

  async create(args: { userId: string; input: __resource__CreateInput }) {
    // Add orchestration here (e.g., image pipeline, logging, validations beyond schema)
    return __resource__Actions.create(this.ctx, args);
  }

  async update(args: { userId: string; input: __resource__UpdateInput }) {
    return __resource__Actions.update(this.ctx, args);
  }

  async delete(args: { userId: string; id: string }) {
    return __resource__Actions.delete(this.ctx, args);
  }
}
