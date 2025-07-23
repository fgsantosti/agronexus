
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function withAuth(Component: any) {
  return async function AuthenticatedPage(props: any) {
    const cookieStore = await cookies();
    const access = cookieStore.get("access")?.value;
    if (!access) {
      redirect("/login");
    }
    return <Component {...props} />;
  }
}
