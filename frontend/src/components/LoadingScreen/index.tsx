export default function LoadingScreen() {
  return (
    <main className="w-full h-full absolute top-0 left-0 bg-zinc-600">
      <div className="w-full h-full flex flex-row justify-center items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:.7s]"></div>
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:.7s]"></div>
      </div>
    </main>
  )
}