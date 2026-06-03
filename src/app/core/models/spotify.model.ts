export interface SpotifyModel {
  id: string;
  songId: string;
  downloadLink: string;
  title: string;
  artist: string;
  coverImage: string;
  status: string;
  deleted: boolean;
  deletedAt?: string;
  favorite: boolean;
  createdAt: string;
}
