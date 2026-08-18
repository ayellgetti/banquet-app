-- CreateEnum
CREATE TYPE "FormPurpose" AS ENUM ('GENERAL', 'ENQUIRY');

-- CreateEnum
CREATE TYPE "IndustryTemplate" AS ENUM ('BANQUET', 'REAL_ESTATE', 'DOCTOR');

-- AlterTable forms
ALTER TABLE "forms" ADD COLUMN "purpose" "FormPurpose" NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "forms" ADD COLUMN "template_key" VARCHAR(64);
CREATE UNIQUE INDEX "forms_template_key_key" ON "forms"("template_key");
CREATE INDEX "idx_form_purpose" ON "forms"("purpose");

-- AlterTable form_questions
ALTER TABLE "form_questions" ADD COLUMN "field_key" VARCHAR(64);

-- AlterTable enquiries
ALTER TABLE "enquiries" ADD COLUMN "form_response_id" BIGINT;
ALTER TABLE "enquiries" ADD COLUMN "answers" JSONB;
CREATE UNIQUE INDEX "enquiries_form_response_id_key" ON "enquiries"("form_response_id");

-- CreateTable workspace_settings
CREATE TABLE "workspace_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "industry_template" "IndustryTemplate" NOT NULL DEFAULT 'BANQUET',
    "enquiry_form_id" BIGINT,
    "follow_up_stages" JSONB NOT NULL,
    "post_confirm_stages" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_form_response_id_fkey" FOREIGN KEY ("form_response_id") REFERENCES "form_responses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "workspace_settings" ADD CONSTRAINT "workspace_settings_enquiry_form_id_fkey" FOREIGN KEY ("enquiry_form_id") REFERENCES "forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
