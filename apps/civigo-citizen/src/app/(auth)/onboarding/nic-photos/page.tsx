import { saveNicPhotos, getNicUploadUrl } from "./_actions";
import NicPhotosClient from "./photos.client";

export default async function NicPhotosStepPage() {
  return <NicPhotosClient getUploadUrlAction={getNicUploadUrl} saveAction={saveNicPhotos} />;
}


