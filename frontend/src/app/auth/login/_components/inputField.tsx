'use client'
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { LoginFormData } from "@/schemas/loginSchema"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"
import { UseFormRegister } from "react-hook-form"

interface InputFieldProps {
  id: string
  type: string
  placeholder: string
  label: string
  className?: string
  register?: ReturnType<UseFormRegister<LoginFormData>>
  errorInvalid?: boolean
  errorMessage?: string
}

export function InputField({ id, type, placeholder, label, className, register, errorInvalid, errorMessage, ...props }: InputFieldProps) {

  const [showPass, setShowPass] = useState(false);

  return (
    <Field className={className} data-invalid={errorInvalid}>
      <FieldLabel htmlFor={id}>{errorInvalid ? "Campo inválido" : label}</FieldLabel>
      <InputGroup>
        <InputGroupInput id={id}
          type={showPass ? "text" : type}
          placeholder={placeholder}
          aria-invalid={errorInvalid}
          {...props}
          {...(register ?? {})} />
        {type === "password" && <InputGroupAddon align="inline-end">
          <button type="button" className="w-2/3 cursor-pointer" onClick={() => {setShowPass(!showPass)}}>{showPass ? <EyeIcon className="w-full"/> : <EyeOffIcon className="w-full"/>}</button>
        </InputGroupAddon>}
      </InputGroup>
      <FieldDescription>
        {errorInvalid ? errorMessage : ""}
      </FieldDescription>
    </Field>
  )
}