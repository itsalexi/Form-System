"use client"

import { useActionState } from "react"
import { submitForm } from "@/lib/actions"
import type { FormState } from "@/types/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full">
      {isPending ? "Submitting..." : "Submit Application"}
    </Button>
  )
}

export default function ApplicationForm() {
  const initialState: FormState = {}
  const [state, formAction, isPending] = useActionState(submitForm, initialState)

  return (
    <Card className="max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Application Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.message && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
              {state.message}
            </div>
          )}
          {state?.error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">{state.error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input name="firstName" placeholder="First Name" required />
            <Input name="lastName" placeholder="Last Name" required />
          </div>

          <Input name="email" type="email" placeholder="Email Address" required />

          <Input name="company" placeholder="Company/Organization" required />

          <Input name="jobTitle" placeholder="Job Title/Role" required />

          <Input name="address" placeholder="Address" required />

          <div className="grid grid-cols-2 gap-4">
            <Input name="phone" type="tel" placeholder="Phone Number" required />
            <Input name="skype" placeholder="Skype ID" />
          </div>

          <Textarea name="about" placeholder="Tell us about yourself" required className="min-h-[100px]" />

          <Textarea
            name="links"
            placeholder="List up to three web links that will help us understand you better"
            className="min-h-[100px]"
          />

          <Textarea
            name="goals"
            placeholder="What do you hope to get from this event?"
            required
            className="min-h-[100px]"
          />

          <SubmitButton isPending={isPending} />
        </form>
      </CardContent>
    </Card>
  )
}

