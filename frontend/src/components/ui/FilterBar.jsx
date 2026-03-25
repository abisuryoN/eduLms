import { Filter, Search } from 'lucide-react'

/**
 * Reusable FilterBar component for consistent filter layout across admin pages.
 * 
 * Layout:
 *   - Filter icon + title at top
 *   - Row 1: Fakultas, Prodi
 *   - Row 2: Semester, Kategori Kelas
 *   - Row 3: Kelas + Search
 * 
 * Props:
 *   - fakultasList, prodiList, kelasList: array of options
 *   - selectedFakultas, selectedProdi, selectedSemester, selectedKategoriKelas, selectedKelas, searchQuery
 *   - onFakultasChange, onProdiChange, onSemesterChange, onKategoriKelasChange, onKelasChange, onSearchChange
 *   - loadingRef: boolean (disable filters while loading reference data)
 *   - showSemester, showKategoriKelas, showKelas, showSearch: boolean (toggle visibility, all default true)
 *   - searchPlaceholder: string
 */
const FilterBar = ({
  // Data lists
  fakultasList = [],
  prodiList = [],
  kelasList = [],
  
  // Selected values
  selectedFakultas = '',
  selectedProdi = '',
  selectedSemester = '',
  selectedKategoriKelas = '',
  selectedKelas = '',
  searchQuery = '',
  
  // Callbacks
  onFakultasChange,
  onProdiChange,
  onSemesterChange,
  onKategoriKelasChange,
  onKelasChange,
  onSearchChange,
  
  // UI control
  loadingRef = false,
  showSemester = true,
  showKategoriKelas = true,
  showKelas = true,
  showSearch = true,
  searchPlaceholder = 'Cari...',
  
  // Disable control (cascading)
  disableProdi,
  disableSemester,
  disableKategoriKelas,
  disableKelas,
}) => {
  const selectClass = 'block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const kategoriOptions = [
    { value: '', label: 'Semua Kategori' },
    { value: 'Reguler Pagi', label: 'Reguler Pagi' },
    { value: 'Reguler Sore', label: 'Reguler Sore' },
    { value: 'Karyawan', label: 'Karyawan' },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-100 dark:border-gray-800">
        <Filter className="h-4 w-4 text-brand-500" />
        <span className="uppercase tracking-wider text-xs font-semibold">Filter Data</span>
      </div>

      {/* Row 1: Fakultas, Prodi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fakultas</label>
          <select
            value={selectedFakultas}
            onChange={(e) => onFakultasChange?.(e.target.value)}
            className={selectClass}
            disabled={loadingRef}
          >
            <option value="">Semua Fakultas</option>
            {fakultasList.map(f => (
              <option key={f.id} value={f.id}>{f.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Program Studi</label>
          <select
            value={selectedProdi}
            onChange={(e) => onProdiChange?.(e.target.value)}
            className={selectClass}
            disabled={disableProdi !== undefined ? disableProdi : !selectedFakultas}
          >
            <option value="">Semua Prodi</option>
            {prodiList.map(p => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Semester, Kategori Kelas */}
      {(showSemester || showKategoriKelas) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showSemester && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => onSemesterChange?.(e.target.value)}
                className={selectClass}
                disabled={disableSemester !== undefined ? disableSemester : !selectedProdi}
              >
                <option value="">Semua Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          )}

          {showKategoriKelas && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Kategori Kelas</label>
              <select
                value={selectedKategoriKelas}
                onChange={(e) => onKategoriKelasChange?.(e.target.value)}
                className={selectClass}
                disabled={disableKategoriKelas !== undefined ? disableKategoriKelas : false}
              >
                {kategoriOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Row 3: Kelas + Search */}
      {(showKelas || showSearch) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showKelas && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Kelas</label>
              <select
                value={selectedKelas}
                onChange={(e) => onKelasChange?.(e.target.value)}
                className={selectClass}
                disabled={disableKelas !== undefined ? disableKelas : kelasList.length === 0}
              >
                <option value="">Semua Kelas</option>
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                ))}
              </select>
            </div>
          )}

          {showSearch && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cari</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { FilterBar }
export default FilterBar
