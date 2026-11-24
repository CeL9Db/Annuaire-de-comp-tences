import { technologies } from "./technologies.ts"

export function TechnologyList() {
  return (
    <section>
      <h2>Technologies</h2>
      <ul>
        {technologies.map((tech) => (
          <li key={tech.id}>{tech.name}</li>
        ))}
      </ul>
    </section>
  )
}
