import { apiFetch, readApiError } from "./api";

export type CareerAssignment = {
  carrera: string;
  anioPlan?: number | null;
};

export async function updateStudentCareers(
  carreras: CareerAssignment[],
): Promise<void> {
  const response = await apiFetch("/me/careers", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ carreras }),
  });
  if (response.status !== 204 && !response.ok) {
    throw await readApiError(response);
  }
}
