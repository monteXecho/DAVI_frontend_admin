import DownArrow from '@/components/icons/DownArrowIcon'

const SortableHeader = ({ 
  children, 
  sortKey, 
  onSort, 
  currentSort, 
  className = '',
  align = 'left'
}) => {
  const getSortDirection = () => {
    if (!currentSort || currentSort.key !== sortKey) return null
    return currentSort.direction
  }

  const sortDirection = getSortDirection()
  
  const handleClick = () => {
    onSort(sortKey)
  }

  return (
    <th 
      className={`px-4 py-2 font-montserrat font-bold text-[16px] text-black cursor-pointer select-none hover:bg-gray-50 transition-colors ${className}`}
      onClick={handleClick}
    >
      <div className={`flex items-center gap-2 whitespace-nowrap ${align === 'center' ? 'justify-center' : ''}`}>
        <span>{children}</span>

        <div className="flex flex-col">
          <DownArrow 
            className={`w-3 h-3 transition-transform ${
              sortDirection === 'ascending' 
                ? 'text-green-500 rotate-180' 
                : sortDirection === 'descending' 
                ? 'text-green-500' 
                : 'text-gray-400'
            }`}
          />
        </div>
      </div>
    </th>
  )
}

export default SortableHeader
