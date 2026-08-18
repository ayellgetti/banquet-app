import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.js';
import { ApiTags, bearerAuth, okResponse } from '../../shared/openapi.js';
import { WorkspaceController } from './workspace.controller.js';
import { WorkspaceService } from './workspace.service.js';

export async function workspaceRoutes(app: FastifyInstance) {
  const controller = new WorkspaceController(new WorkspaceService(app.prisma));

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.workspace],
      summary: 'Get workspace industry settings, enquiry form, and pipeline stages',
      security: bearerAuth,
      response: okResponse(),
    },
    handler: (request, reply) => controller.get(request, reply),
  });

  app.patch('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.workspace],
      summary: 'Update industry template or linked enquiry form',
      security: bearerAuth,
      response: okResponse(),
    },
    handler: (request, reply) => controller.update(request, reply),
  });
}
