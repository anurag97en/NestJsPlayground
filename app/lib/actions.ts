'use server';
import {z} from 'zod'; 
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createInvoice(formData: FormData) {
//For less data use this approach
// const rawData={
//     customerId:formData.get('customerId'),
//     amount:formData.get('amount'),
//     status:formData.get('status')
// }

//Use formEntries for multiple data handling

//For Validation of data use Typescript library Zod
const FormSchema=z.object({
    id:z.string(),
    customerId:z.string(),
    amount:z.coerce.number(),
    status:z.enum(['pending','paid']),
    date:z.string(),
})

const CreateInvoice=FormSchema.omit({id:true,date:true})

// const rawFormData = Object.fromEntries(formData.entries())
//
const {customerId,amount,status}=CreateInvoice.parse({
    customerId:formData.get('customerId'),
    amount:formData.get('amount'),
    status:formData.get('status'),
})
const amountInCents=amount*100;
const date=new Date().toISOString().split('T')[0];

//Add into Database
await sql`INSERT INTO invoices (customer_id, amount, status, date)
VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;

//revalidatePath()-> clear cache and trigger a new request to the server
revalidatePath('/dashboard/invoices');
//redirect()-> redirect to the initial page
redirect('/dashboard/invoices');

// const rawData={
//     customerId:rawFormData.customerId,
//     amount:rawFormData.amount,
//     status:rawFormData.status
// }

// console.log("rawData",rawData)
// console.log(typeof rawFormData.amount);
}
 
export async function updateInvoice(id: string, formData: FormData) {

    const FormSchema=z.object({
        id:z.string(),
        customerId:z.string(),
        amount:z.coerce.number(),
        status:z.enum(['pending','paid']),
        date:z.string(),
    })
  
  const UpdateInvoice = FormSchema.omit({ id: true, date: true });

  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}