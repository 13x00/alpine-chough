'use client'

import { useState } from 'react'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { useContent } from '@/hooks/useContent'
import { Project, Photography, ImageCollection } from '@/types/content'
import imageCollection01 from '@/content/collections/image-collection-01/collection.json'

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
  const [isDetailClosing, setIsDetailClosing] = useState(false)
  const [detailDirection, setDetailDirection] = useState<'forward' | 'backward'>('forward')

  const hasDetailOpen = selectedItem !== null && currentView !== 'portrait'
  const useNarrowLayout = hasDetailOpen || isDetailClosing

  const handleHomeClick = () => {
    if (hasDetailOpen) setIsDetailClosing(true)
    goHome()
  }

  const collection = imageCollection01 as ImageCollection

  // Combined list: collection first, then single photography items (for slide order)
  const allImageEntries: Array<
    { id: string; title: string; category: string; image: string; view: 'collection' | 'photography'; item: ImageCollection | Photography }
  > = [
    {
      id: collection.id,
      title: collection.title,
      category: 'Collection',
      image: collection.coverImage,
      view: 'collection',
      item: collection,
    },
    ...mockImages.map((p) => ({
      id: p.id,
      title: p.title,
      category: 'Photography',
      image: p.image,
      view: 'photography' as const,
      item: p,
    })),
  ]

  const imageItems = allImageEntries.map((entry, nextIndex) => ({
    id: entry.id,
    title: entry.title,
    category: entry.category,
    image: entry.image,
    onClick: () => {
      if ((currentView === 'photography' || currentView === 'collection') && selectedItem) {
        const currentIndex = allImageEntries.findIndex((e) => e.id === selectedItem.id)
        if (currentIndex !== -1 && nextIndex !== currentIndex) {
          setDetailDirection(nextIndex > currentIndex ? 'forward' : 'backward')
        } else {
          setDetailDirection('forward')
        }
      } else {
        setDetailDirection('forward')
      }
      setView(entry.view, entry.item)
    },
  }))

  const projectItems = mockProjects.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    image: item.image,
    onClick: () => {
      // Determine slide direction within the project list
      if (currentView === 'project' && selectedItem) {
        const currentIndex = mockProjects.findIndex((p) => p.id === selectedItem.id)
        const nextIndex = mockProjects.findIndex((p) => p.id === item.id)
        if (currentIndex !== -1 && nextIndex !== -1 && nextIndex !== currentIndex) {
          setDetailDirection(nextIndex > currentIndex ? 'forward' : 'backward')
        } else {
          setDetailDirection('forward')
        }
      } else {
        // First open into projects
        setDetailDirection('forward')
      }
      setView('project', item)
    },
  }))

  return (
    <SplitLayout
      currentTab={currentTab}
      currentView={currentView}
      selectedItem={selectedItem}
      onTabChange={setTab}
      onHomeClick={handleHomeClick}
      useNarrowLayout={useNarrowLayout}
      onDetailCloseComplete={() => setIsDetailClosing(false)}
      detailDirection={detailDirection}
      imageItems={imageItems}
      projectItems={projectItems}
    />
  )
}
