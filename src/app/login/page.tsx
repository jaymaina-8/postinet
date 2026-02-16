import { redirect } from "next/navigation";

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

// Alias route to keep `/login?...` working (canonical auth UI lives at `/auth/login`).
export default function LoginAliasPage({ searchParams }: Props) {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value == null) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    }
  }
  const qs = params.toString();
  redirect(`/auth/login${qs ? `?${qs}` : ""}`);
}

