import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.js';
import { ApiTags, bearerAuth, createdResponse, idParam, okResponse, paginationQuery } from '../../shared/openapi.js';
import { FormController } from './form.controller.js';
import { FormRepository } from './form.repository.js';
import { FormService } from './form.service.js';

export async function formRoutes(app: FastifyInstance) {
  const repository = new FormRepository(app.prisma);
  const service = new FormService(repository, app.prisma);
  const controller = new FormController(service);

  app.get('/public/:slug', {
    schema: {
      tags: [ApiTags.forms],
      summary: 'Get a published form by share link',
      response: okResponse(),
    },
    handler: (request, reply) => controller.getPublic(request, reply),
  });

  app.post('/public/:slug/responses', {
    schema: {
      tags: [ApiTags.forms],
      summary: 'Submit a published form',
      response: createdResponse(),
    },
    handler: (request, reply) => controller.submit(request, reply),
  });

  app.get('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.forms],
      summary: 'List forms',
      security: bearerAuth,
      querystring: paginationQuery,
      response: okResponse(),
    },
    handler: (request, reply) => controller.list(request, reply),
  });

  app.post('/', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.forms],
      summary: 'Create a form',
      security: bearerAuth,
      response: createdResponse(),
    },
    handler: (request, reply) => controller.create(request, reply),
  });

  app.get('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.forms],
      summary: 'Get a form',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.getById(request, reply),
  });

  app.patch('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.forms],
      summary: 'Update a form and its questions',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.update(request, reply),
  });

  app.delete('/:id', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.forms],
      summary: 'Delete a form',
      security: bearerAuth,
      params: idParam,
      response: okResponse(),
    },
    handler: (request, reply) => controller.delete(request, reply),
  });

  app.get('/:id/responses', {
    preHandler: [authenticate],
    schema: {
      tags: [ApiTags.forms],
      summary: 'List form responses',
      security: bearerAuth,
      params: idParam,
      querystring: paginationQuery,
      response: okResponse(),
    },
    handler: (request, reply) => controller.listResponses(request, reply),
  });
}
