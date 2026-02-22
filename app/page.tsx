'use client'

import { SplitLayout } from '@/components/layout/SplitLayout'
import { useContent } from '@/hooks/useContent'
import { Project, Photography } from '@/types/content'

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Occ Studio — Brand Identity',
    description: 'Visual identity and brand system for a multidisciplinary design studio. Logo marks, typography, and application across print and digital.',
    image: '/placeholder-project.jpg',
    category: 'Brand identity',
    tags: ['Logo', 'Typography', 'Print'],
  },
  {
    id: '2',
    title: 'Municipal Archive — Service Design',
    description: 'Service design and interaction concept for a city archive. User research, journey mapping, and prototype for a new discovery interface.',
    image: '/placeholder-project.jpg',
    category: 'Service design',
    tags: ['Research', 'Prototyping', 'Public sector'],
  },
  {
    id: '3',
    title: 'Alpine Chough — Portfolio',
    description: 'Personal hub and archive for design work, articles, and photography. Built with Next.js, TypeScript, and a warm gray design system.',
    image: '/placeholder-project.jpg',
    category: 'Web & interaction',
    tags: ['Next.js', 'Design system', 'Portfolio'],
  },
  {
    id: '4',
    title: 'Editorial — AHO Yearbook',
    description: 'Art direction and layout design for the Oslo School of Architecture and Design yearbook. Grid system and image-led spreads.',
    image: '/placeholder-project.jpg',
    category: 'Editorial',
    tags: ['Art direction', 'Layout', 'Print'],
  },
  {
    id: '5',
    title: 'Food Co-op — App Concept',
    description: 'Concept for a neighbourhood food co-op app: ordering, pickup slots, and member communication. UI and flow design.',
    image: '/placeholder-project.jpg',
    category: 'UI/UX',
    tags: ['App design', 'User flows', 'Concept'],
  },
]

const mockImages: Photography[] = [
  {
    id: '1',
    title: 'Mountain Landscape',
    image: '/placeholder-image.jpg',
    description: 'A view of alpine mountains and late afternoon light. Shot in the Norwegian highlands.',
    tags: ['Landscape', 'Nature'],
  },
  {
    id: '2',
    title: 'Urban Architecture',
    image: '/placeholder-image.jpg',
    description: 'Modern cityscape and building facades. Exploring rhythm and repetition in the built environment.',
    tags: ['Architecture', 'Urban'],
  },
  {
    id: '3',
    title: 'Portrait — Freckles',
    image: '/placeholder-image.jpg',
    description: 'Close-up portrait in natural light. Part of a series on skin and texture.',
    tags: ['Portrait', 'Natural light'],
  },
  {
    id: '4',
    title: 'Still Life — Table',
    image: '/placeholder-image.jpg',
    description: 'Everyday objects arranged on a table. Soft shadows and warm tones.',
    tags: ['Still life', 'Interior'],
  },
  {
    id: '5',
    title: 'Street — Oslo',
    image: '/placeholder-image.jpg',
    description: 'Street photography in central Oslo. Moments and passers-by in winter light.',
    tags: ['Street', 'Documentary'],
  },
  {
    id: '6',
    title: 'Coast — West Norway',
    image: '/placeholder-image.jpg',
    description: 'Rocky coastline and sea. Long exposure and neutral density filters.',
    tags: ['Seascape', 'Long exposure'],
  },
]

export default function Home() {
  const { currentTab, currentView, selectedItem, setTab, setView, goHome } = useContent()

  const imageItems = mockImages.map((item) => ({
    id: item.id,
    title: item.title,
    category: 'Photography',
    image: item.image,
    onClick: () => setView('photography', item),
  }))

  const projectItems = mockProjects.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    image: item.image,
    onClick: () => setView('project', item),
  }))

  return (
    <SplitLayout
      currentTab={currentTab}
      currentView={currentView}
      selectedItem={selectedItem}
      onTabChange={setTab}
      onHomeClick={goHome}
      imageItems={imageItems}
      projectItems={projectItems}
    />
  )
}
