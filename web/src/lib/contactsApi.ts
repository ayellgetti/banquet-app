import type { ContactType } from "@/data/banquetData";
import { fetchCustomersFromApi, createCustomerViaApi } from "@/lib/customersApi";
import { fetchVendorsFromApi, createVendorViaApi, fetchVendorCategoriesFromApi } from "@/lib/vendorsApi";
import { apiRequest } from "@/lib/apiClient";
import type { Paginated } from "@/lib/apiTypes";
import { normalizeMobileNo, splitCustomerName } from "@/lib/mappers/enquiryMapper";

export type ContactRecord = {
  /** Stable list key, e.g. `customer:12` */
  id: string;
  sourceId: string;
  type: ContactType;
  name: string;
  email: string;
  phone: string;
  /** City for customers, category for vendors, notes for others */
  detail?: string;
  createdAt: string;
};

export type CreateContactInput = {
  type: ContactType;
  name: string;
  mobile?: string;
  email?: string;
  city?: string;
  address?: string;
  notes?: string;
  categoryId?: string | null;
  gstNumber?: string | null;
};

type ApiDirectoryContact = {
  id: string;
  type: "EMPLOYEE" | "OTHER";
  name: string;
  mobile: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
};

function mapDirectoryType(type: "EMPLOYEE" | "OTHER"): ContactType {
  return type === "EMPLOYEE" ? "employee" : "other";
}

async function fetchDirectoryContactsFromApi(): Promise<ContactRecord[]> {
  try {
    const page = await apiRequest<Paginated<ApiDirectoryContact>>(
      "/directory-contacts?limit=100&sortBy=createdAt&order=desc",
    );
    return page.items.map((item) => ({
      id: `${mapDirectoryType(item.type)}:${item.id}`,
      sourceId: item.id,
      type: mapDirectoryType(item.type),
      name: item.name,
      email: item.email ?? "",
      phone: item.mobile ?? "",
      detail: item.notes ?? item.address ?? undefined,
      createdAt: item.createdAt,
    }));
  } catch {
    return [];
  }
}

export async function fetchContactsFromApi(): Promise<ContactRecord[]> {
  const [customers, vendors, directory] = await Promise.all([
    fetchCustomersFromApi(),
    fetchVendorsFromApi(),
    fetchDirectoryContactsFromApi(),
  ]);

  const customerContacts: ContactRecord[] = customers.map((c) => ({
    id: `customer:${c.id}`,
    sourceId: c.id,
    type: "customer",
    name: c.name,
    email: c.email,
    phone: c.phone,
    detail: c.notes,
    createdAt: c.createdAt,
  }));

  const vendorContacts: ContactRecord[] = vendors.map((v) => ({
    id: `vendor:${v.id}`,
    sourceId: v.id,
    type: "vendor",
    name: v.name,
    email: v.email,
    phone: v.phone ?? "",
    detail: v.category,
    createdAt: v.createdAt,
  }));

  return [...customerContacts, ...vendorContacts, ...directory].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createContactViaApi(input: CreateContactInput): Promise<ContactRecord> {
  const name = input.name.trim();
  const mobile = input.mobile ? normalizeMobileNo(input.mobile) : "";
  const email = input.email?.trim() || null;

  if (input.type === "customer") {
    const { firstName, lastName } = splitCustomerName(name);
    const customer = await createCustomerViaApi({
      firstName,
      lastName,
      mobileNo: mobile,
      emailId: email,
      city: input.city?.trim() || null,
    });
    return {
      id: `customer:${customer.id}`,
      sourceId: customer.id,
      type: "customer",
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      detail: customer.notes,
      createdAt: customer.createdAt,
    };
  }

  if (input.type === "vendor") {
    const vendor = await createVendorViaApi({
      vendorName: name,
      categoryId: input.categoryId || null,
      mobile: mobile || null,
      email,
      address: input.address?.trim() || null,
      gstNumber: input.gstNumber?.trim() || null,
      notes: input.notes?.trim() || null,
    });
    return {
      id: `vendor:${vendor.id}`,
      sourceId: vendor.id,
      type: "vendor",
      name: vendor.name,
      email: vendor.email,
      phone: mobile,
      detail: vendor.category,
      createdAt: vendor.createdAt,
    };
  }

  const apiType = input.type === "employee" ? "EMPLOYEE" : "OTHER";
  const contact = await apiRequest<ApiDirectoryContact>("/directory-contacts", {
    method: "POST",
    body: {
      type: apiType,
      name,
      mobile: mobile || null,
      email,
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });

  return {
    id: `${mapDirectoryType(contact.type)}:${contact.id}`,
    sourceId: contact.id,
    type: mapDirectoryType(contact.type),
    name: contact.name,
    email: contact.email ?? "",
    phone: contact.mobile ?? "",
    detail: contact.notes ?? contact.address ?? undefined,
    createdAt: contact.createdAt,
  };
}

export { fetchVendorCategoriesFromApi };
