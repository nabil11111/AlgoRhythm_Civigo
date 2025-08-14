import { saveNicPhotos, getNicUploadUrl, uploadNicPhoto } from "./_actions";
import NicPhotosClient from "./photos.client";
import { requireStepAllowed } from "../_state";

export default async function NicPhotosStepPage() {
  await requireStepAllowed("nic-photos");
  return <NicPhotosClient getUploadUrlAction={getNicUploadUrl} uploadAction={uploadNicPhoto} saveAction={saveNicPhotos} />;
}


