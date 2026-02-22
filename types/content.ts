export type ContentType = 'images' | 'projects'
export type ViewType = 'portrait' | 'project' | 'article' | 'photography'

export interface Project {
  id: string
  title: string
  description: string
  image: string
  category?: string
  tags?: string[]
  date?: string
  content?: string
}

export interface Article {
  id: string
  title: string
  description: string
  image?: string
  date: string
  content: string
  tags?: string[]
}

export interface Photography {
  id: string
  title: string
  image: string
  description?: string
  date?: string
  tags?: string[]
}

export interface NavItem {
  id: string
  title: string
  type: ContentType
  image: string
  onClick: () => void
}
