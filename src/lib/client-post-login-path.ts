export function clientPostLoginPath(redirect: string | undefined): string {
  if (redirect?.startsWith("/")) return redirect;
  return "/tasks";
}
