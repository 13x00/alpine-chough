'use client'

import { useState } from 'react'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { PageLoader } from '@/components/transition/PageLoader'
import { useContent } from '@/hooks/useContent'
import { Project, Photography, ImageCollection } from '@/types/content'
import imageCollection01 from '@/content/collections/image-collection-01/collection.json'

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Occ Studio — Brand Identity',
    description: 'Visual identity and brand system for a multidisciplinary design studio. Logo marks, typography, and application across print and digital.',
    image: '/Portrait_cycle/AM_Portrait.jpg',
    category: 'Brand identity',
    tags: ['Logo', 'Typography', 'Print'],
  },
  {
    id: '2',
    title: 'Municipal Archive — Service Design',
    description: 'Service design and interaction concept for a city archive. User research, journey mapping, and prototype for a new discovery interface.',
    image: '/Portrait_cycle/AM_Portrait.jpg',
    category: 'Service design',
    tags: ['Research', 'Prototyping', 'Public sector'],
  },
  {
    id: '3',
    title: 'Alpine Chough — Portfolio',
    description: 'Personal hub and archive for design work, articles, and photography. Built with Next.js, TypeScript, and a warm gray design system.',
    image: '/Portrait_cycle/AM_Portrait.jpg',
    category: 'Web & interaction',
    tags: ['Next.js', 'Design system', 'Portfolio'],
  },
  {
    id: '4',
    title: 'Editorial — AHO Yearbook',
    description: 'Art direction and layout design for the Oslo School of Architecture and Design yearbook. Grid system and image-led spreads.',
    image: '/Portrait_cycle/AM_Portrait.jpg',
    category: 'Editorial',
    tags: ['Art direction', 'Layout', 'Print'],
  },
  {
    id: '5',
    title: 'Food Co-op — App Concept',
    description: 'Concept for a neighbourhood food co-op app: ordering, pickup slots, and member communication. UI and flow design.',
    image: '/Portrait_cycle/AM_Portrait.jpg',
    category: 'UI/UX',
    tags: ['App design', 'User flows', 'Concept'],
  },
]

const mockImages: Photography[] = [
  {
    id: '1',
    title: 'Mountain Landscape',
    image: '/Portrait_cycle/IMG_6396.jpg',
    description: 'A view of alpine mountains and late afternoon light. Shot in the Norwegian highlands.',
    tags: ['Landscape', 'Nature'],
  },
  {
    id: '2',
    title: 'Urban Architecture',
    image: '/Portrait_cycle/118_1808_Original.jpg',
    description: 'Modern cityscape and building facades. Exploring rhythm and repetition in the built environment.',
    tags: ['Architecture', 'Urban'],
  },
  {
    id: '3',
    title: 'Portrait — Freckles',
    image: '/Portrait_cycle/DSC02816 2 7.png',
    description: 'Close-up portrait in natural light. Part of a series on skin and texture.',
    tags: ['Portrait', 'Natural light'],
  },
  {
    id: '4',
    title: 'Still Life — Table',
    image: '/Portrait_cycle/DSC02816 2 8.png',
    description: 'Everyday objects arranged on a table. Soft shadows and warm tones.',
    tags: ['Still life', 'Interior'],
  },
  {
    id: '5',
    title: 'Street — Oslo',
    image: '/Portrait_cycle/DSC02816 2 9.png',
    description: 'Street photography in central Oslo. Moments and passers-by in winter light.',
    tags: ['Street', 'Documentary'],
  },
  {
    id: '6',
    title: 'Coast — West Norway',
    image: '/Portrait_cycle/DSC02816 2 10.png',
    description: 'Rocky coastline and sea. Long exposure and neutral density filters.',
    tags: ['Seascape', 'Long exposure'],
  },
]

export default function Home() {
  const { currentView, selectedItem, setView, goHome } = useContent()
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
    <>
      {/* Page-load intro animation — fixed overlay, unmounts after completion */}
      <PageLoader />
      <SplitLayout
        currentView={currentView}
        selectedItem={selectedItem}
        onHomeClick={handleHomeClick}
        useNarrowLayout={useNarrowLayout}
        onDetailCloseComplete={() => setIsDetailClosing(false)}
        detailDirection={detailDirection}
        imageItems={imageItems}
        projectItems={projectItems}
      />
    </>
  )
}
