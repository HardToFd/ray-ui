import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';

export interface DataTableColumn<T extends { id: string }> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  caption?: string;
}

type SortDirection = 'asc' | 'desc';

function textValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toLocaleDateString('zh-CN');
  return String(value);
}

function compareValues(left: unknown, right: unknown): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return (Number.isFinite(left) ? left : 0) - (Number.isFinite(right) ? right : 0);
  }
  if (left instanceof Date && right instanceof Date) return left.getTime() - right.getTime();
  return textValue(left).localeCompare(textValue(right), 'zh-CN', { numeric: true, sensitivity: 'base' });
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = '搜索数据…',
  pageSize = 5,
  caption = '数据列表',
}: DataTableProps<T>) {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: keyof T; direction: SortDirection } | null>(null);
  const limit = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 5;

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = data.filter((row) => !normalizedQuery || columns.some((column) =>
      textValue(row[column.key]).toLocaleLowerCase().includes(normalizedQuery),
    ));
    if (!sort || !columns.some((column) => column.key === sort.key && column.sortable)) return filtered;
    return filtered.map((row, index) => ({ row, index })).sort((left, right) => {
      const leftValue = left.row[sort.key];
      const rightValue = right.row[sort.key];
      // Missing values stay at the end in both sort directions.
      if (leftValue == null && rightValue != null) return 1;
      if (rightValue == null && leftValue != null) return -1;
      const result = compareValues(leftValue, rightValue);
      return (sort.direction === 'asc' ? result : -result) || left.index - right.index;
    }).map(({ row }) => row);
  }, [data, columns, query, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / limit));
  const currentPage = page > pageCount ? 1 : page;
  const firstRow = (currentPage - 1) * limit;
  const visibleRows = rows.slice(firstRow, firstRow + limit);

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);

  const handleSort = (key: keyof T) => {
    setSort((previous) => ({
      key,
      direction: previous?.key === key && previous.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  return (
    <div className="ray-data-table">
      <div className="ray-data-table-toolbar">
        <label className="ray-data-table-search-label" htmlFor={searchId}>搜索{caption}</label>
        <div className="ray-data-table-search-wrap">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="ray-data-table-search-icon">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            id={searchId}
            type="search"
            className="ray-data-table-search"
            value={query}
            placeholder={searchPlaceholder}
            onChange={(event) => { setQuery(event.target.value); setPage(1); }}
          />
        </div>
        <span className="ray-data-table-result-count" role="status">{rows.length} 条结果</span>
      </div>

      <div className="ray-data-table-scroll" role="region" aria-label={caption} tabIndex={0}>
        <table className="ray-data-table-table">
          <caption className="ray-data-table-caption">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={`${String(column.key)}-${index}`}
                  scope="col"
                  aria-sort={column.sortable
                    ? sort?.key === column.key
                      ? sort.direction === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                    : undefined}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="ray-data-table-sort"
                      onClick={() => handleSort(column.key)}
                      aria-label={`按${column.header}${sort?.key === column.key && sort.direction === 'asc' ? '降序' : '升序'}排列`}
                    >
                      {column.header}
                      <span aria-hidden="true" className="ray-data-table-sort-icon">
                        {sort?.key === column.key ? sort.direction === 'asc' ? '↑' : '↓' : '↕'}
                      </span>
                    </button>
                  ) : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? visibleRows.map((row) => (
              <tr key={row.id}>
                {columns.map((column, index) => (
                  <td key={`${String(column.key)}-${index}`}>
                    {column.render ? column.render(row[column.key], row) : textValue(row[column.key]) || '—'}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={Math.max(1, columns.length)} className="ray-data-table-empty">
                  <span className="ray-data-table-empty-title">{query.trim() ? '没有匹配结果' : '暂无数据'}</span>
                  <span>{query.trim() ? '试试其他关键词，或清除搜索。' : '添加数据后，会显示在这里。'}</span>
                  {query.trim() && <button type="button" className="ray-data-table-clear" onClick={() => { setQuery(''); setPage(1); }}>清除搜索</button>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="ray-data-table-footer">
        <span className="ray-data-table-range">
          {rows.length === 0 ? '共 0 条' : `第 ${firstRow + 1}–${Math.min(firstRow + limit, rows.length)} 条，共 ${rows.length} 条`}
        </span>
        <nav className="ray-data-table-pagination" aria-label={`${caption}分页`}>
          <button type="button" className="ray-data-table-page-button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="上一页">←</button>
          <span className="ray-data-table-page-label" aria-live="polite" aria-atomic="true">{currentPage} / {pageCount}</span>
          <button type="button" className="ray-data-table-page-button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-label="下一页">→</button>
        </nav>
      </div>
    </div>
  );
}

export interface FilterBarOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterBarProps {
  options: FilterBarOption[];
  value: string;
  onValueChange: (value: string) => void;
  'aria-label'?: string;
}

export function FilterBar({ options, value, onValueChange, 'aria-label': ariaLabel = '筛选条件' }: FilterBarProps) {
  return (
    <div className="ray-filter-bar" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="ray-filter-bar-option"
          aria-pressed={value === option.value}
          onClick={() => onValueChange(option.value)}
        >
          {option.label}
          {option.count !== undefined && <span className="ray-filter-bar-count">{option.count}</span>}
        </button>
      ))}
    </div>
  );
}
