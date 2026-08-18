export type ProcurementState = {
  requestedBy: string;
  phone: string;
  requiredByDate: string;
  eventReference: string;
  notes: string;
  quantities: Record<string, number>;
};

export const initialProcurement: ProcurementState = {
  requestedBy: "",
  phone: "",
  requiredByDate: "",
  eventReference: "",
  notes: "",
  quantities: {},
};
