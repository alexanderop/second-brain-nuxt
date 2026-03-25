/** Shape returned by queryCollection on the server side */
export interface ServerContentItem {
  path?: string;
  stem?: string;
  title?: string;
  type?: string;
  tags?: string[];
  authors?: string[];
  summary?: string;
  body?: unknown;
  date?: string;
  rating?: number;
}
