import { useState } from 'react';
import { DatePicker } from '../src/components/date-picker';

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function DatePickerDemo({ expanded = false }: { expanded?: boolean }) {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 8, 9));
  return (
    <div className={expanded ? 'date-picker-examples' : 'date-picker-demo'}>
      <div className="date-picker-demo">
        {expanded && <span className="date-example-label">基础选择</span>}
        <DatePicker
          label="项目启动日期"
          value={date}
          onValueChange={setDate}
          name="startDate"
          placeholder="选择一个日子"
          hint="为下一个好点子，选个开始的日子。"
        />
        <div className="date-selection-note" role="status">
          <span className="status-dot" />
          {date ? <>已选择 <code>{formatDate(date)}</code></> : '还没决定？先留一点期待。'}
        </div>
      </div>
      {expanded && (
        <div className="date-picker-demo">
          <span className="date-example-label">限制可选日期</span>
          <DatePicker
            label="交付日期"
            minDate={new Date(2026, 8, 1)}
            maxDate={new Date(2026, 8, 30)}
            placeholder="选择交付日期"
            hint="演示范围：2026 年 9 月 1–30 日。"
          />
          <span className="date-range-note">范围外日期不可选，选中后自动收起。</span>
        </div>
      )}
    </div>
  );
}
