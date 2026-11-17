import { readTable } from "./data/dataSheets.ts"

console.log(await readTable("technologie"))
console.log(await readTable("skill"))
console.log(await readTable("role"))
console.log(await readTable("session"))
console.log(await readTable("user"))
