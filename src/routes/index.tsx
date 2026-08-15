import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <main>
      hello world
      <Link to="/status" className="ml-2 underline underline-offset-4">
        System status
      </Link>
    </main>
  )
}
