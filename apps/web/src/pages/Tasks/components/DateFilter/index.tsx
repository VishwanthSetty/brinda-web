import { Group, SegmentedControl, Select } from '@mantine/core'
import { Calendar } from 'lucide-react'
import { MonthPickerInput } from '@mantine/dates'
import dayjs from 'dayjs'
import '@mantine/dates/styles.css';

interface DateFilterProps {
    view: 'weekly' | 'monthly' | 'custom';
    range: [Date | null, Date | null];
    onViewChange: (view: 'weekly' | 'monthly' | 'custom') => void;
    onRangeChange: (range: [Date | null, Date | null]) => void;
}

export function DateFilter({ view, range, onViewChange, onRangeChange }: DateFilterProps) {
    const selectedDate = range[0] ? dayjs(range[0]) : dayjs()

    // Helper to generate weeks for a given month
    const getWeeksInMonth = (monthDate: dayjs.Dayjs) => {
        const weeks: { label: string; value: string; start: dayjs.Dayjs; end: dayjs.Dayjs }[] = []

        // Start from the first Monday of the month (or the Monday before if month starts mid-week)
        let current = monthDate.startOf('month').day(1)
        if (current.isAfter(monthDate.startOf('month'))) {
            current = current.subtract(1, 'week')
        }

        const endOfMonth = monthDate.endOf('month')

        while (current.isBefore(endOfMonth)) {
            const weekStart = current
            const weekEnd = current.add(6, 'day')

            weeks.push({
                label: `${weekStart.format('DD MMM')} - ${weekEnd.format('DD MMM')}`,
                value: weekStart.toISOString(),
                start: weekStart,
                end: weekEnd
            })

            current = current.add(1, 'week')
        }
        return weeks
    }

    const weeks = getWeeksInMonth(selectedDate)
    const activeWeekValue = weeks.find(w => w.start.isSame(selectedDate, 'day'))?.value || (weeks.length > 0 ? weeks[0].value : '')

    // Handler for single month selection (Monthly view)
    const handleSingleMonthSelect = (date: Date | null) => {
        if (!date) return
        const d = dayjs(date)
        onRangeChange([d.startOf('month').toDate(), d.endOf('month').toDate()])
    }

    // Handler for month range selection (Custom view)
    const handleMonthRangeSelect = (dates: [Date | null, Date | null]) => {
        if (!dates[0]) return

        const start = dayjs(dates[0]).startOf('month')
        // If end date is selected, process it. Otherwise, keep it null to allow picking the second date.
        const end = dates[1] ? dayjs(dates[1]).endOf('month') : null

        onRangeChange([start.toDate(), end ? end.toDate() : null])
    }

    // Handler for weekly view month jump
    const handleWeeklyMonthSelect = (date: Date | null) => {
        if (!date) return
        const d = dayjs(date)
        const newWeeks = getWeeksInMonth(d)
        if (newWeeks.length > 0) {
            onRangeChange([newWeeks[0].start.toDate(), newWeeks[0].end.toDate()])
        }
    }

    const handleViewChange = (value: 'weekly' | 'monthly' | 'custom') => {
        onViewChange(value)
        const d = dayjs()

        if (value === 'weekly') {
            const startOfWeek = d.startOf('week').add(1, 'day') // Monday
            const endOfWeek = startOfWeek.add(6, 'day')
            onRangeChange([startOfWeek.toDate(), endOfWeek.toDate()])
        } else if (value === 'monthly') {
            onRangeChange([d.startOf('month').toDate(), d.endOf('month').toDate()])
        } else {
            // Custom: default to last 2 months
            const startMonth = d.subtract(1, 'month').startOf('month')
            const endMonth = d.endOf('month')
            onRangeChange([startMonth.toDate(), endMonth.toDate()])
        }
    }

    return (
        <Group align="center" gap="md">
            <SegmentedControl
                value={view}
                onChange={(val) => handleViewChange(val as 'weekly' | 'monthly' | 'custom')}
                data={[
                    { label: 'Weekly', value: 'weekly' },
                    { label: 'Monthly', value: 'monthly' },
                    { label: 'Custom', value: 'custom' },
                ]}
                radius="md"
                size="sm"
            />

            {view === 'monthly' && (
                <MonthPickerInput
                    label={null}
                    placeholder="Pick month"
                    value={range[0] || new Date()}
                    onChange={(val) => handleSingleMonthSelect(val as Date | null)}
                    maxDate={new Date()}
                    style={{ width: 180 }}
                    leftSection={<Calendar size={16} strokeWidth={1.5} />}
                    radius="md"
                    size="sm"
                    clearable={false}
                />
            )}

            {view === 'custom' && (
                <MonthPickerInput
                    type="range"
                    label={null}
                    placeholder="Pick month range"
                    value={range}
                    onChange={(val) => handleMonthRangeSelect(val as any)}
                    maxDate={new Date()}
                    style={{ width: 280 }}
                    leftSection={<Calendar size={16} strokeWidth={1.5} />}
                    radius="md"
                    size="sm"
                    clearable={false}
                    allowSingleDateInRange
                />
            )}

            {view === 'weekly' && (
                <>
                    <MonthPickerInput
                        label={null}
                        placeholder="Pick month"
                        value={range[0] || new Date()}
                        onChange={(val) => handleWeeklyMonthSelect(val as Date | null)}
                        maxDate={new Date()}
                        style={{ width: 160 }}
                        leftSection={<Calendar size={16} strokeWidth={1.5} />}
                        radius="md"
                        size="sm"
                        clearable={false}
                    />
                    <Select
                        data={weeks}
                        value={activeWeekValue}
                        onChange={(val) => {
                            const w = weeks.find(item => item.value === val)
                            if (w) {
                                onRangeChange([w.start.toDate(), w.end.toDate()])
                            }
                        }}
                        style={{ width: 180 }}
                        radius="md"
                        size="sm"
                        allowDeselect={false}
                    />
                </>
            )}
        </Group>
    )
}
