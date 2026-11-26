import { apiFetch, readApiError } from "./api";

export async function downloadMyData(): Promise<void> {
  const response = await apiFetch("/me/export");
  if (!response.ok) {
    throw await readApiError(response);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "mis-datos.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function deleteMyAccount(password: string): Promise<void> {
  const response = await apiFetch("/me", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (response.status === 204) return;
  if (!response.ok) {
    throw await readApiError(response);
  }
}
