import { NextResponse, type NextRequest } from "next/server";

/** "/" -> "/pt" ou "/en" conforme o idioma do navegador. */
export function proxy(request: NextRequest) {
  const accept = request.headers.get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  const lang = first.startsWith("pt") || first === "" ? "pt" : "en";
  return NextResponse.redirect(new URL(`/${lang}`, request.url));
}

export const config = { matcher: ["/"] };
