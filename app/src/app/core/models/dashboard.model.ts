import { Observable } from 'rxjs';

export interface Tile {
  title: string;
  obs: Observable<any[]>;
  link?: string | null;
  color: string;
  valueProp: string;
}