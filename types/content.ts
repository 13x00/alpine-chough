export type ViewType = 'portrait' | 'photo' | 'collection'

export interface Collection {
  id: string
  title: string
  slug: string
  description: string
  coverImage: string
  images: string[]
}

export interface Photo {
  id: string
  title: string
  image: string
  description?: string
  date?: string
  tags?: string[]
}

export type DetailItem = Photo | Collection
