import { delay } from "./delay";

export async function uploadFilesMock(files) {
  await delay(700);

  return files.map((file) => ({
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    status: "uploaded",
  }));
}