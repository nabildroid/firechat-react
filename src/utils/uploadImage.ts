import { storage, Timestamp } from "../main";
import { UploadTaskSnapshot } from "@firebase/storage-types";

function UplaodImage(
  file: File,
  name: string,
  directory: string,
  randomSuffix: boolean = false
): Promise<UploadTaskSnapshot> {
  const random = Math.floor(Math.random() * 1000);

  const fileName =
    name + (randomSuffix ? random + Timestamp.now().toMillis() : "");

  const filePath = `${directory}/${fileName}.jpg`;
  const fileRef = storage.child(filePath);

  const uploadTask = fileRef.put(file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      null,
      reject,
      resolve.bind(this, uploadTask.snapshot)
    );
  });
}

export default UplaodImage;
