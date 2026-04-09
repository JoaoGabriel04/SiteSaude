export default function Title1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl font-bold font-poppins text-zinc-800">
      {children}
    </h1>
  )
}