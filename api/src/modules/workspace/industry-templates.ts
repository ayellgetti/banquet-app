import { FormQuestionType, IndustryTemplate, type LeadStatus } from '@prisma/client';

export type PipelineStageKind = 'open' | 'convert' | 'close' | 'post_confirm';

export type PipelineStageDef = {
  key: string;
  label: string;
  kind: PipelineStageKind;
  sortOrder: number;
  /** Maps UI/stage key → stored LeadStatus */
  leadStatus: LeadStatus;
};

export type EnquiryQuestionSeed = {
  fieldKey: string;
  type: FormQuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
};

export type IndustryTemplateDef = {
  key: IndustryTemplate;
  label: string;
  description: string;
  enquiryForm: {
    templateKey: string;
    title: string;
    description: string;
    questions: EnquiryQuestionSeed[];
  };
  followUpStages: PipelineStageDef[];
  postConfirmStages: PipelineStageDef[];
};

const banquetFollowUp: PipelineStageDef[] = [
  { key: 'new', label: 'New', kind: 'open', sortOrder: 0, leadStatus: 'NEW' },
  { key: 'contacted', label: 'Contacted', kind: 'open', sortOrder: 1, leadStatus: 'CONTACTED' },
  { key: 'qualified', label: 'Qualified', kind: 'open', sortOrder: 2, leadStatus: 'QUALIFIED' },
  { key: 'visit_scheduled', label: 'Visit scheduled', kind: 'open', sortOrder: 3, leadStatus: 'FOLLOW_UP' },
  { key: 'quotation_sent', label: 'Quotation sent', kind: 'open', sortOrder: 4, leadStatus: 'QUOTATION_SENT' },
  { key: 'negotiation', label: 'Negotiation', kind: 'open', sortOrder: 5, leadStatus: 'NEGOTIATION' },
  { key: 'booked', label: 'Booking confirmed', kind: 'convert', sortOrder: 6, leadStatus: 'CONVERTED' },
  { key: 'fake', label: 'Fake', kind: 'close', sortOrder: 7, leadStatus: 'FAKE' },
  { key: 'not_interested', label: 'Not interested', kind: 'close', sortOrder: 8, leadStatus: 'NOT_INTERESTED' },
  { key: 'other', label: 'Other', kind: 'close', sortOrder: 9, leadStatus: 'OTHER' },
];

const banquetPostConfirm: PipelineStageDef[] = [
  { key: 'confirmed', label: 'Confirmed', kind: 'post_confirm', sortOrder: 0, leadStatus: 'CONVERTED' },
  { key: 'menu_finalized', label: 'Menu finalized', kind: 'post_confirm', sortOrder: 1, leadStatus: 'CONVERTED' },
  { key: 'decor_locked', label: 'Decor locked', kind: 'post_confirm', sortOrder: 2, leadStatus: 'CONVERTED' },
  { key: 'completed', label: 'Event completed', kind: 'post_confirm', sortOrder: 3, leadStatus: 'CONVERTED' },
];

const realEstateFollowUp: PipelineStageDef[] = [
  { key: 'new', label: 'New lead', kind: 'open', sortOrder: 0, leadStatus: 'NEW' },
  { key: 'contacted', label: 'Called', kind: 'open', sortOrder: 1, leadStatus: 'CONTACTED' },
  { key: 'qualified', label: 'Interested', kind: 'open', sortOrder: 2, leadStatus: 'QUALIFIED' },
  { key: 'visit_scheduled', label: 'Site visit', kind: 'open', sortOrder: 3, leadStatus: 'FOLLOW_UP' },
  { key: 'quotation_sent', label: 'Offer shared', kind: 'open', sortOrder: 4, leadStatus: 'QUOTATION_SENT' },
  { key: 'negotiation', label: 'Negotiation', kind: 'open', sortOrder: 5, leadStatus: 'NEGOTIATION' },
  { key: 'booked', label: 'Token / booked', kind: 'convert', sortOrder: 6, leadStatus: 'CONVERTED' },
  { key: 'fake', label: 'Invalid lead', kind: 'close', sortOrder: 7, leadStatus: 'FAKE' },
  { key: 'not_interested', label: 'Not interested', kind: 'close', sortOrder: 8, leadStatus: 'NOT_INTERESTED' },
  { key: 'other', label: 'Other', kind: 'close', sortOrder: 9, leadStatus: 'OTHER' },
];

const realEstatePostConfirm: PipelineStageDef[] = [
  { key: 'token_received', label: 'Token received', kind: 'post_confirm', sortOrder: 0, leadStatus: 'CONVERTED' },
  { key: 'agreement', label: 'Agreement signed', kind: 'post_confirm', sortOrder: 1, leadStatus: 'CONVERTED' },
  { key: 'registration', label: 'Registration', kind: 'post_confirm', sortOrder: 2, leadStatus: 'CONVERTED' },
  { key: 'handover', label: 'Handover', kind: 'post_confirm', sortOrder: 3, leadStatus: 'CONVERTED' },
];

const doctorFollowUp: PipelineStageDef[] = [
  { key: 'new', label: 'New enquiry', kind: 'open', sortOrder: 0, leadStatus: 'NEW' },
  { key: 'contacted', label: 'Called', kind: 'open', sortOrder: 1, leadStatus: 'CONTACTED' },
  { key: 'qualified', label: 'Needs consult', kind: 'open', sortOrder: 2, leadStatus: 'QUALIFIED' },
  { key: 'visit_scheduled', label: 'Appointment set', kind: 'open', sortOrder: 3, leadStatus: 'FOLLOW_UP' },
  { key: 'quotation_sent', label: 'Plan shared', kind: 'open', sortOrder: 4, leadStatus: 'QUOTATION_SENT' },
  { key: 'negotiation', label: 'Follow-up care', kind: 'open', sortOrder: 5, leadStatus: 'NEGOTIATION' },
  { key: 'booked', label: 'Confirmed patient', kind: 'convert', sortOrder: 6, leadStatus: 'CONVERTED' },
  { key: 'fake', label: 'Wrong number', kind: 'close', sortOrder: 7, leadStatus: 'FAKE' },
  { key: 'not_interested', label: 'Not interested', kind: 'close', sortOrder: 8, leadStatus: 'NOT_INTERESTED' },
  { key: 'other', label: 'Other', kind: 'close', sortOrder: 9, leadStatus: 'OTHER' },
];

const doctorPostConfirm: PipelineStageDef[] = [
  { key: 'consult_done', label: 'Consult done', kind: 'post_confirm', sortOrder: 0, leadStatus: 'CONVERTED' },
  { key: 'treatment_started', label: 'Treatment started', kind: 'post_confirm', sortOrder: 1, leadStatus: 'CONVERTED' },
  { key: 'review', label: 'Review visit', kind: 'post_confirm', sortOrder: 2, leadStatus: 'CONVERTED' },
  { key: 'discharged', label: 'Closed / discharged', kind: 'post_confirm', sortOrder: 3, leadStatus: 'CONVERTED' },
];

export const INDUSTRY_TEMPLATES: Record<IndustryTemplate, IndustryTemplateDef> = {
  BANQUET: {
    key: IndustryTemplate.BANQUET,
    label: 'Banquet / events',
    description: 'Hall bookings, weddings, and private events.',
    enquiryForm: {
      templateKey: 'banquet-enquiry',
      title: 'Banquet enquiry',
      description: 'Event details for banquet enquiries. Name and phone are collected separately.',
      questions: [
        {
          fieldKey: 'event_type',
          type: FormQuestionType.DROPDOWN,
          title: 'Event type',
          required: true,
          options: ['Wedding', 'Reception', 'Engagement', 'Birthday', 'Corporate', 'Other'],
        },
        {
          fieldKey: 'event_date',
          type: FormQuestionType.DATE,
          title: 'Preferred event date',
          required: true,
        },
        {
          fieldKey: 'time_slot',
          type: FormQuestionType.DROPDOWN,
          title: 'Time slot',
          required: true,
          options: ['Morning', 'Evening', 'Full day'],
        },
        {
          fieldKey: 'guest_count',
          type: FormQuestionType.SHORT_ANSWER,
          title: 'Guest count',
          required: true,
        },
        {
          fieldKey: 'venue',
          type: FormQuestionType.SHORT_ANSWER,
          title: 'Venue / hall',
          required: false,
        },
        {
          fieldKey: 'lead_source',
          type: FormQuestionType.DROPDOWN,
          title: 'Lead source',
          required: true,
          options: ['Walk-in', 'Phone', 'WhatsApp', 'Instagram', 'Referral', 'Website', 'Other'],
        },
        {
          fieldKey: 'approx_budget',
          type: FormQuestionType.DROPDOWN,
          title: 'Approx budget',
          required: false,
          options: ['Under ₹1L', '₹1L–₹3L', '₹3L–₹5L', '₹5L–₹10L', 'Above ₹10L'],
        },
        {
          fieldKey: 'menu_package',
          type: FormQuestionType.SHORT_ANSWER,
          title: 'Menu / plate package',
          required: false,
        },
        {
          fieldKey: 'decoration_required',
          type: FormQuestionType.MULTIPLE_CHOICE,
          title: 'Decoration required?',
          required: false,
          options: ['Yes', 'No'],
        },
        {
          fieldKey: 'special_requirements',
          type: FormQuestionType.PARAGRAPH,
          title: 'Special requirements',
          required: false,
        },
      ],
    },
    followUpStages: banquetFollowUp,
    postConfirmStages: banquetPostConfirm,
  },
  REAL_ESTATE: {
    key: IndustryTemplate.REAL_ESTATE,
    label: 'Real estate',
    description: 'Builder / sales team lead tracking for property enquiries.',
    enquiryForm: {
      templateKey: 'real-estate-enquiry',
      title: 'Property enquiry',
      description: 'Project and buyer preference fields. Name and phone are collected separately.',
      questions: [
        {
          fieldKey: 'project_name',
          type: FormQuestionType.SHORT_ANSWER,
          title: 'Project / society',
          required: true,
        },
        {
          fieldKey: 'property_type',
          type: FormQuestionType.DROPDOWN,
          title: 'Property type',
          required: true,
          options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Plot', 'Commercial', 'Other'],
        },
        {
          fieldKey: 'budget_range',
          type: FormQuestionType.DROPDOWN,
          title: 'Budget range',
          required: true,
          options: ['Under ₹50L', '₹50L–₹1Cr', '₹1Cr–₹2Cr', 'Above ₹2Cr'],
        },
        {
          fieldKey: 'preferred_location',
          type: FormQuestionType.SHORT_ANSWER,
          title: 'Preferred location',
          required: false,
        },
        {
          fieldKey: 'site_visit_date',
          type: FormQuestionType.DATE,
          title: 'Preferred site visit date',
          required: false,
        },
        {
          fieldKey: 'lead_source',
          type: FormQuestionType.DROPDOWN,
          title: 'Lead source',
          required: true,
          options: ['Walk-in', 'Phone', 'Channel partner', 'Website', 'Housing.com', 'Referral', 'Other'],
        },
        {
          fieldKey: 'notes',
          type: FormQuestionType.PARAGRAPH,
          title: 'Notes',
          required: false,
        },
      ],
    },
    followUpStages: realEstateFollowUp,
    postConfirmStages: realEstatePostConfirm,
  },
  DOCTOR: {
    key: IndustryTemplate.DOCTOR,
    label: 'Doctor / clinic',
    description: 'Patient enquiry and appointment follow-up for clinics.',
    enquiryForm: {
      templateKey: 'doctor-enquiry',
      title: 'Patient enquiry',
      description: 'Clinical intake fields. Patient name and phone are collected separately.',
      questions: [
        {
          fieldKey: 'concern',
          type: FormQuestionType.SHORT_ANSWER,
          title: 'Chief concern',
          required: true,
        },
        {
          fieldKey: 'department',
          type: FormQuestionType.DROPDOWN,
          title: 'Department',
          required: true,
          options: ['General', 'Dental', 'Dermatology', 'Orthopedic', 'Gynecology', 'Pediatrics', 'Other'],
        },
        {
          fieldKey: 'preferred_date',
          type: FormQuestionType.DATE,
          title: 'Preferred appointment date',
          required: true,
        },
        {
          fieldKey: 'preferred_time',
          type: FormQuestionType.TIME,
          title: 'Preferred time',
          required: false,
        },
        {
          fieldKey: 'age',
          type: FormQuestionType.SHORT_ANSWER,
          title: 'Age',
          required: false,
        },
        {
          fieldKey: 'lead_source',
          type: FormQuestionType.DROPDOWN,
          title: 'How did they find us?',
          required: true,
          options: ['Walk-in', 'Phone', 'WhatsApp', 'Google', 'Referral', 'Other'],
        },
        {
          fieldKey: 'notes',
          type: FormQuestionType.PARAGRAPH,
          title: 'Notes',
          required: false,
        },
      ],
    },
    followUpStages: doctorFollowUp,
    postConfirmStages: doctorPostConfirm,
  },
};

export function getIndustryTemplate(key: IndustryTemplate): IndustryTemplateDef {
  return INDUSTRY_TEMPLATES[key];
}
