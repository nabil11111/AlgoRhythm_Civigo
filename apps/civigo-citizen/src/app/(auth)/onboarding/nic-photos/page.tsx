import { saveNicPhotos, getNicUploadUrl, uploadNicPhoto } from "./_actions";
import NicPhotosClient from "./photos.client";

export default async function NicPhotosStepPage() {
  return <NicPhotosClient getUploadUrlAction={getNicUploadUrl} uploadAction={uploadNicPhoto} saveAction={saveNicPhotos} />;
}


