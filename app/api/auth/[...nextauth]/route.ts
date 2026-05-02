import { handler } from "./handler"

// Force dynamic rendering to skip static generation
export const dynamic = "force-dynamic"
export const revalidate = 0

export { handler as GET, handler as POST }
