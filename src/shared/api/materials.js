import { fetchMaterialsMock } from "../../mock/materials.api";

export async function fetchMaterials() {
  // Backend API отсутствует
  // Используется mock
  return fetchMaterialsMock();
}