'use client'

import { useState } from 'react'
import { SplitLayout } from '@/components/layout/SplitLayout'
import { PageLoader } from '@/components/transition/PageLoader'
import { useContent } from '@/hooks/useContent'
import { Photo, Collection } from '@/types/content'

const mockPhotos: Photo[] = [
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

const mockCollections: Collection[] = [
  {
    id: 'col-1',
    title: 'Norwegian Landscapes',
    slug: 'norwegian-landscapes',
    description: 'A selection of mountain and coastal scenes from Norway.',
    coverImage: '/Portrait_cycle/IMG_6396.jpg',
    images: ['/Portrait_cycle/IMG_6396.jpg', '/Portrait_cycle/DSC02816 2 10.png'],
  },
  {
    id: 'col-2',
    title: 'Urban Frames',
    slug: 'urban-frames',
    description: 'Architecture and street photography from city explorations.',
    coverImage: '/Portrait_cycle/118_1808_Original.jpg',
    images: ['/Portrait_cycle/118_1808_Original.jpg', '/Portrait_cycle/DSC02816 2 9.png'],
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

  // Combined list: photos first, then collections (order used for slide direction)
  const allEntries: Array<{ id: string; title: string; view: 'photo' | 'collection'; item: Photo | Collection }> = [
    ...mockPhotos.map((p) => ({ id: p.id, title: p.title, view: 'photo' as const, item: p })),
    ...mockCollections.map((c) => ({ id: c.id, title: c.title, view: 'collection' as const, item: c })),
  ]

  const projectItems = allEntries.map((entry, nextIndex) => ({
    id: entry.id,
    title: entry.title,
    category: entry.view === 'photo' ? 'Photo' : 'Collection',
    image: entry.view === 'photo' ? (entry.item as Photo).image : (entry.item as Collection).coverImage,
    onClick: () => {
      if ((currentView === 'photo' || currentView === 'collection') && selectedItem) {
        const currentIndex = allEntries.findIndex((e) => e.id === selectedItem.id)
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

  return (
    <>
      {/* Page-load intro animation — fixed overlay, unmounts after completion */}
      <PageLoader />
      <SplitLayout
        currentView={currentView}
        selectedItem={selectedItem}
        onCloseDetail={handleHomeClick}
        useNarrowLayout={useNarrowLayout}
        onDetailCloseComplete={() => setIsDetailClosing(false)}
        detailDirection={detailDirection}
        projectItems={projectItems}
      />
    </>
  )
}
