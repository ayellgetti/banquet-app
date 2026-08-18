import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../shared/response.js';
import { parseEnquiryFormId, updateWorkspaceSchema } from './workspace.schema.js';
import { WorkspaceService } from './workspace.service.js';

export class WorkspaceController {
  constructor(private readonly service: WorkspaceService) {}

  async get(_request: FastifyRequest, reply: FastifyReply) {
    const data = await this.service.getSettings();
    return reply.send(successResponse(data));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const input = updateWorkspaceSchema.parse(request.body);

    if (input.industryTemplate !== undefined) {
      await this.service.updateIndustry(input.industryTemplate);
    }

    if (input.enquiryFormId !== undefined) {
      await this.service.setEnquiryForm(parseEnquiryFormId(input.enquiryFormId) ?? null);
    }

    const data = await this.service.getSettings();
    return reply.send(successResponse(data));
  }
}
