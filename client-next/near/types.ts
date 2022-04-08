export interface Link {
  order: any;
  uri: string,
  title: string,
  description: string,
  id: number,
  image_uri?: string | null,
}

export interface Hub {
  title: string,
  description: string,
  image_uri?: string,
  owner_account_id?: string,
  links: Array<Link>;
}
export interface HubDto {
  title: string,
  description: string,
  image_uri?: string | null,
}