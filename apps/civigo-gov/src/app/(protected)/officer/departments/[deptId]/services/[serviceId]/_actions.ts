"use server";

import { upsertServiceInstructions as _upsert, uploadServiceInstructionsPdf as _upload } from "../_actions";

export async function upsertServiceInstructions(
  ...args: Parameters<typeof _upsert>
): ReturnType<typeof _upsert> {
  // delegate to parent module
  // eslint-disable-next-line @typescript-eslint/return-await
  return await _upsert(...args);
}

export async function uploadServiceInstructionsPdf(
  ...args: Parameters<typeof _upload>
): ReturnType<typeof _upload> {
  // eslint-disable-next-line @typescript-eslint/return-await
  return await _upload(...args);
}



