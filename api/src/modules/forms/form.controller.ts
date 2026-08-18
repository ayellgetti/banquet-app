import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../../shared/errors/app-error.js';
import { parseIdParam } from '../../shared/params.js';
import { successResponse } from '../../shared/response.js';
import {
  createFormSchema,
  listFormsQuerySchema,
  slugParamSchema,
  submitFormSchema,
  updateFormSchema,
} from './form.schema.js';
import type { FormService } from './form.service.js';

export class FormController {
  constructor(private readonly service: FormService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = listFormsQuerySchema.parse(request.query);
    const result = await this.service.list(query);
    return reply.send(successResponse(result));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const form = await this.service.getById(parseIdParam(id));
    return reply.send(successResponse(form));
  }

  async getPublic(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = slugParamSchema.parse(request.params);
    const form = await this.service.getPublicBySlug(slug);
    return reply.send(successResponse(form));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AppError('Unauthorized', 401);
    }
    const input = createFormSchema.parse(request.body ?? {});
    const form = await this.service.create(BigInt(request.user.id), input);
    return reply.status(201).send(successResponse(form));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const input = updateFormSchema.parse(request.body);
    const form = await this.service.update(parseIdParam(id), input);
    return reply.send(successResponse(form));
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const result = await this.service.delete(parseIdParam(id));
    return reply.send(successResponse(result));
  }

  async listResponses(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const query = listFormsQuerySchema.parse(request.query);
    const result = await this.service.listResponses(parseIdParam(id), query);
    return reply.send(successResponse(result));
  }

  async submit(request: FastifyRequest, reply: FastifyReply) {
    const { slug } = slugParamSchema.parse(request.params);
    const input = submitFormSchema.parse(request.body);
    const result = await this.service.submit(slug, input);
    return reply.status(201).send(successResponse(result));
  }
}
