import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoginFormData } from "@/schemas/loginSchema"
import { error } from "console"
import { UseFormRegister } from "react-hook-form"

interface InputFieldProps {
  id: string
  type: string
  placeholder: string
  label: string
  description: string
  className?: string
  register?: ReturnType<UseFormRegister<LoginFormData>>
  errorInvalid?: boolean
  errorMessage?: string
}

export function InputField({ id, type, placeholder, label, description, className, register, errorInvalid, errorMessage, ...props }: InputFieldProps) {

  return (
    <Field className={className} data-invalid={errorInvalid}>
      <FieldLabel htmlFor="input-field-username">{errorInvalid ? "Invalid Input" : label}</FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-invalid={errorInvalid}
        {...props}
        {...(register ?? {})}
      />
      <FieldDescription>
        {errorInvalid ? errorMessage : description}
      </FieldDescription>
    </Field>
  )
}