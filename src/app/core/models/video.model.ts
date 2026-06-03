export interface VideoModel {
  id: string;
  videoId: string;
  link: string;
  title: string;
  thumbnail: string;
  progress: number;
  duration: number;
  status: string;
  msg: string;
  deleted: boolean;
  deletedAt?: string;
  favorite: boolean;
  createdAt: string;
}
