import type { Form, FormQuestion, FormResponse, Prisma, PrismaClient } from '@prisma/client';
import type { ListFormsQuery } from './form.schema.js';

const formInclude = {
  questions: { orderBy: { sortOrder: 'asc' as const } },
  _count: { select: { responses: true, questions: true } },
} as const;

export type FormWithQuestions = Form & {
  questions: FormQuestion[];
  _count: { responses: number; questions: number };
};

export class FormRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(query: ListFormsQuery) {
    const { page, limit, search } = query;
    const where = this.buildWhere(search);

    return this.prisma.$transaction([
      this.prisma.form.findMany({
        where,
        include: formInclude,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.form.count({ where }),
    ]);
  }

  findById(id: bigint) {
    return this.prisma.form.findUnique({
      where: { id },
      include: formInclude,
    });
  }

  findBySlug(slug: string) {
    return this.prisma.form.findUnique({
      where: { slug },
      include: formInclude,
    });
  }

  create(data: Prisma.FormCreateInput) {
    return this.prisma.form.create({
      data,
      include: formInclude,
    });
  }

  update(id: bigint, data: Prisma.FormUncheckedUpdateInput) {
    return this.prisma.form.update({
      where: { id },
      data,
      include: formInclude,
    });
  }

  delete(id: bigint) {
    return this.prisma.form.delete({ where: { id } });
  }

  createQuestion(data: Prisma.FormQuestionUncheckedCreateInput) {
    return this.prisma.formQuestion.create({ data });
  }

  updateQuestion(id: bigint, data: Prisma.FormQuestionUncheckedUpdateInput) {
    return this.prisma.formQuestion.update({ where: { id }, data });
  }

  deleteQuestions(formId: bigint, keepIds: bigint[]) {
    return this.prisma.formQuestion.deleteMany({
      where: {
        formId,
        ...(keepIds.length > 0 ? { id: { notIn: keepIds } } : {}),
      },
    });
  }

  listResponses(formId: bigint, page: number, limit: number) {
    const where = { formId };
    return this.prisma.$transaction([
      this.prisma.formResponse.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.formResponse.count({ where }),
    ]);
  }

  createResponse(data: Prisma.FormResponseUncheckedCreateInput) {
    return this.prisma.formResponse.create({ data });
  }

  private buildWhere(search?: string): Prisma.FormWhereInput | undefined {
    if (!search?.trim()) return undefined;
    const term = search.trim();
    return {
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ],
    };
  }
}

export type { FormResponse };
