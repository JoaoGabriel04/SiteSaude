import React from "react";

export default function Subtitle({children}: {children: React.ReactNode}) {
  return (
    <p className="font-poppins text-sm text-zinc-700/50 mt-2">{children}</p>
  )
}