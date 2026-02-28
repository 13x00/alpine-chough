'use client'

import type { ViewType, DetailItem } from '@/types/content'

interface DetailOverlayProps {
  showDetail: boolean
  isExpanded: boolean
  displayItem: DetailItem | null
  outgoingItem: DetailItem | null
  swapAnimating: boolean
  displayView: ViewType
  outgoingView: ViewType | null
  direction: 'forward' | 'backward'
  onBack: () => void
  renderDetail: (view: ViewType, item: DetailItem, onBack: () => void) => React.ReactNode
}

export function DetailOverlay({
  showDetail,
  isExpanded,
  displayItem,
  outgoingItem,
  swapAnimating,
  displayView,
  outgoingView,
  direction,
  onBack,
  renderDetail,
}: DetailOverlayProps) {
  return (
    <>
      {/* Backdrop overlay - clickable area to close */}
      {(displayItem || outgoingItem) && (
        <div
          className={`absolute inset-0 z-10 transition-opacity duration-300 bg-black/40 ${
            showDetail || outgoingItem ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onBack}
        />
      )}

      {/* Outgoing detail - full section slides out when switching items */}
      {outgoingItem && (
        <div
          key={`outgoing-${outgoingView}-${outgoingItem.id}`}
          className={`absolute inset-0 z-20 transition-transform duration-300 ease-out ${
            swapAnimating
              ? direction === 'forward'
                ? '-translate-x-full'
                : 'translate-x-full'
              : 'translate-x-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full h-full bg-layer-02 overflow-y-auto shadow-lg">
            {outgoingView && renderDetail(outgoingView, outgoingItem, onBack)}
          </div>
        </div>
      )}

      {/* Detail Views - card that slides in, then expands to full section */}
      {displayItem && (
        <div
          key={`detail-${displayView}-${displayItem.id}`}
          className={`absolute inset-0 z-20 transition-all duration-300 ease-out ${
            outgoingItem
              ? swapAnimating
                ? 'translate-x-0'
                : direction === 'forward'
                  ? 'translate-x-full'
                  : '-translate-x-full'
              : showDetail
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0'
          } ${isExpanded && !outgoingItem ? 'p-0' : 'py-2 px-4 md:px-6 flex items-center justify-center'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`bg-layer-02 overflow-y-auto shadow-lg transition-all duration-300 ease-out ${
              isExpanded && !outgoingItem ? 'w-full h-full rounded-none' : 'h-full w-[85%] max-w-4xl rounded-xl'
            }`}
          >
            {displayView && displayItem && renderDetail(displayView, displayItem, onBack)}
          </div>
        </div>
      )}
    </>
  )
}
