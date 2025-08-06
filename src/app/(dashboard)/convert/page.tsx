import { auth } from "@/lib/auth"
import { ConvertView } from "@/modules/convert/ui/views/convert-view"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const ConvertPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  return <ConvertView />
}

export default ConvertPage 