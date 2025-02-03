"use server"

import { createClient } from "@/utils/supabase"
import { revalidatePath } from "next/cache"
import type { FormSubmission } from "@/types/form"

export type FormState = {
  message?: string
  error?: string
}

export async function submitForm(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const supabase = await createClient()

  try {
    const formEntries = Array.from(formData.entries())
      .filter(([key]) => !key.startsWith("$"))
      .reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value,
        }),
        {},
      )

    console.log("Cleaned form data to submit:", formEntries)

    if (process.env.GOOGLE_APPS_SCRIPT_URL) {
      try {
        const response = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify(formEntries),
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.error("Failed to submit to Google Apps Script")
        }
      } catch (error) {
        console.error("Error submitting to Google Apps Script:", error)
      }
    }

    const { data, error: supabaseError } = await supabase.from("form_responses").insert([formEntries]).select()

    console.log("Supabase insert response:", { data, error: supabaseError })

    if (supabaseError) {
      throw supabaseError
    }

    return { message: "Form submitted successfully!" }
  } catch (error) {
    console.error("Submission error:", error)
    return {
      error: "Failed to submit form. Please try again.",
    }
  }
}

export async function getSubmissions() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("form_responses").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching submissions:", error)
    throw error
  }

  return data as FormSubmission[]
}

export async function updateSubmissionStatus(id: string, status: "approved" | "rejected") {
  const supabase = await createClient()
  const { error } = await supabase.from("form_responses").update({ status }).eq("id", id)
  if (error) {
    console.error("Error updating submission status:", error)
    throw error
  }

  revalidatePath("/dashboard")
  revalidatePath("/submissions")
  return { success: true }
}

