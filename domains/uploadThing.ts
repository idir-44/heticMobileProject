type Type = "IMAGE";
type Models = "RECONGNITION";

export type UpdatePhotoRequest = {
  model: Models;
  type: Type;
  data: { img1: string };
};

export type UploadThingRes = {
  probability: string;
  result: string;
};
