'use client'
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { LoginFormData } from "@/schemas/loginSchema"
import { RegisterFormPatient } from "@/schemas/registerSchema"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState, InputHTMLAttributes } from "react"
import { UseFormRegister } from "react-hook-form"

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  register?: ReturnType<UseFormRegister<any>>
  errorInvalid?: boolean
  errorMessage?: string
  mask?: "phone" | "cpf" | "numbers" | "cns"
}

export function InputField({ id, type, placeholder, label, className, register, errorInvalid, errorMessage, mask, ...props }: InputFieldProps) {

  const [showPass, setShowPass] = useState(false);
  const { onChange, ...restRegister } = register ?? {}

  function formatPhone(value: string) {
    const numbers = value.replace(/\D/g, "").slice(0, 11)

    if (numbers.length === 0) return ""

    const part1 = numbers.slice(0, 2)
    const part2 = numbers.slice(2, 7)
    const part3 = numbers.slice(7, 11)

    if (numbers.length <= 2) return `(${part1}`
    if (numbers.length <= 7) return `(${part1}) ${part2}`

    return `(${part1}) ${part2}-${part3}`
  }

  function formatCPF(value: string) {
    let v = value.replace(/\D/g, "")

    if (v.length > 11) v = v.slice(0, 11)

    v = v.replace(/(\d{3})(\d)/, "$1.$2")
    v = v.replace(/(\d{3})(\d)/, "$1.$2")
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2")

    return v
  }

  function formatCNS(value: string) {
    let v = value.replace(/\D/g, "").slice(0, 15)

    if (v.length <= 3) return v
    if (v.length <= 7) return `${v.slice(0, 3)} ${v.slice(3)}`
    if (v.length <= 11) return `${v.slice(0, 3)} ${v.slice(3, 7)} ${v.slice(7)}`

    return `${v.slice(0, 3)} ${v.slice(3, 7)} ${v.slice(7, 11)} ${v.slice(11)}`
  }

  function applyMask(value: string, mask?: string) {
    if (mask === "phone") return formatPhone(value)

    if (mask === "cpf") return formatCPF(value)

    if (mask === "cns") return formatCNS(value)

    if (mask === "numbers") return value.replace(/\D/g, "")

    return value
  }

  return (
    <Field className={className} data-invalid={errorInvalid}>
      <FieldLabel htmlFor={id}>{errorInvalid ? "Campo inválido" : label}</FieldLabel>
      <InputGroup>
        <InputGroupInput id={id}
          type={showPass ? "text" : type}
          placeholder={placeholder}
          aria-invalid={errorInvalid}
          inputMode={mask ? "numeric" : undefined}
          {...restRegister}
          {...props}
          onChange={(e) => {
            e.target.value = applyMask(e.target.value, mask)
            onChange?.(e)
            props.onChange?.(e)
          }} />
        {type === "password" && <InputGroupAddon align="inline-end">
          <button type="button" className="w-2/3 cursor-pointer" onClick={() => { setShowPass(!showPass) }}>{showPass ? <EyeIcon className="w-full" /> : <EyeOffIcon className="w-full" />}</button>
        </InputGroupAddon>}
      </InputGroup>
      <FieldDescription>
        {errorInvalid ? errorMessage : ""}
      </FieldDescription>
    </Field>
  )
}