import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import SideBarAdmin from "./SideBarAdmin"
export default async function Layout({ children }: any) {

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect("/login")
  }

  return (
    <SideBarAdmin user={session.user}>
      {children}
    </SideBarAdmin>
  )
}