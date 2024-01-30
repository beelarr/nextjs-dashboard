'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type FormSchema = {
  id: string;
  customerId: string;
  amount: string;
  status: 'pending' | 'paid';
  date: string;
};

type Invoice = Omit<FormSchema, 'id' | 'date'>;

export const createInvoice = async (formData: FormData) => {
  const { customerId, amount, status } = Object.fromEntries(
    formData.entries(),
  ) as Invoice;
  const amountInCents = Number(amount) * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
};

export const updateInvoice = async (id: string, formData: FormData) => {
  const { customerId, amount, status } = Object.fromEntries(
    formData.entries(),
  ) as Invoice;
  const amountInCents = Number(amount) * 100;
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
};

export const deleteInvoice = async (id: string) => {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
};
