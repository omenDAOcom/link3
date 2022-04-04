export interface Link {
  uri: string,
  title: string,
  description: string,
  id?: string,
  image_uri?: string | null,
  is_published?: boolean,
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