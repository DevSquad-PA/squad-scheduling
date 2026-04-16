import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import SideBarAdmin from "./SideBarAdmin"
export default async function Layout({ children }: any) {
  let session = null
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch (err) {
    console.error("DB/session error in dashboard layout:", err)
    return (
      <div className="p-8">
        <h2 className="text-lg font-bold">Erro de conexão</h2>
        <p>Não foi possível conectar ao banco de dados. Tente novamente mais tarde.</p>
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  return (
    <SideBarAdmin user={session.user}>
      {children}
    </SideBarAdmin>
  )
}