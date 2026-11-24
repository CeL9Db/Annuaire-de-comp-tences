import { MergeTechnologies } from "./MergeTechnologies.tsx"
import { TechnologyList } from "./TechnologyList.tsx"

export function AdminPage() {
  return (
    <main>
      <h1>Administration</h1>
      <TechnologyList />
      <MergeTechnologies />
    </main>
  )
}
