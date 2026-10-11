import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  ArrowRight, 
  ShieldCheck, 
  CheckSquare, 
  MapPin, 
  CalendarDays,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { getWorkOrders } from '../../services/workOrdersService';
import { getProperties } from '../../services/propertiesService';
import { FacilityTask, CommercialProperty, ServiceCategory } from '../../types';

const TRADE_LABELS: Record<string, string> = {
  'commercial-hvac': 'Commercial HVAC',
  'electrical': 'Commercial Electrical',
  'plumbing': 'Commercial Plumbing',
  'preventive-maintenance': 'Preventive Maintenance',
  'general-maintenance': 'General Maintenance',
  'emergency-services': 'Emergency Services'
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Safe calendar date helpers avoiding UTC timezone shifts
function parseDateParts(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
}

function formatDateString(year: number, monthIndex: number, day: number): string {
  const y = year.toString().padStart(4, '0');
  const m = (monthIndex + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const WorkspaceCalendar: React.FC = () => {
  const [tasks, setTasks] = useState<FacilityTask[]>([]);
  const [properties, setProperties] = useState<CommercialProperty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [workOrdersRes, propertiesRes] = await Promise.all([
      getWorkOrders(),
      getProperties()
    ]);

    if (workOrdersRes.error || propertiesRes.error) {
      const errMsg = workOrdersRes.error?.message || propertiesRes.error?.message || 'Failed to load calendar operations.';
      setError(errMsg);
    } else {
      setTasks(workOrdersRes.data || []);
      setProperties(propertiesRes.data || []);
    }
    setIsLoading(false);
  }, []);

  // Operational system date derived dynamically from current local Date
  const now = new Date();

  const todayStr = formatDateString(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // Currently displayed calendar month view (year and 0-indexed month)
  const [viewYear, setViewYear] = useState<number>(now.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(now.getMonth());
  
  // Selected day defaults to today
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    formatDateString(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
  );

  // Operational Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tradeFilter, setTradeFilter] = useState<string>('all');

  // Real-time synchronization listeners
  useEffect(() => {
    fetchCalendarData();

    const handleTasksUpdate = () => {
      fetchCalendarData();
    };

    window.addEventListener('northstar_tasks_updated', handleTasksUpdate);

    return () => {
      window.removeEventListener('northstar_tasks_updated', handleTasksUpdate);
    };
  }, [fetchCalendarData]);

  // Map properties for fast O(1) context lookup
  const propertyMap = useMemo(() => {
    const map = new Map<string, CommercialProperty>();
    properties.forEach((p) => map.set(p.id, p));
    return map;
  }, [properties]);

  // Dynamically derive available trade categories from actual task records
  const availableTrades = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.serviceCategory) set.add(t.serviceCategory);
    });
    return Array.from(set);
  }, [tasks]);

  // Tasks with valid dueDates vs unscheduled
  const { scheduledTasks, unscheduledTasks } = useMemo(() => {
    const scheduled: FacilityTask[] = [];
    const unscheduled: FacilityTask[] = [];

    tasks.forEach((t) => {
      if (t.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate)) {
        scheduled.push(t);
      } else {
        unscheduled.push(t);
      }
    });

    return { scheduledTasks: scheduled, unscheduledTasks: unscheduled };
  }, [tasks]);

  // Filter tasks based on status and trade selections
  const filteredScheduledTasks = useMemo(() => {
    return scheduledTasks.filter((t) => {
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchTrade = tradeFilter === 'all' || t.serviceCategory === tradeFilter;
      return matchStatus && matchTrade;
    });
  }, [scheduledTasks, statusFilter, tradeFilter]);

  // Month-view Tasks Map: 'YYYY-MM-DD' => FacilityTask[]
  const dateTaskMap = useMemo(() => {
    const map = new Map<string, FacilityTask[]>();
    filteredScheduledTasks.forEach((t) => {
      if (!t.dueDate) return;
      const list = map.get(t.dueDate) || [];
      list.push(t);
      map.set(t.dueDate, list);
    });
    return map;
  }, [filteredScheduledTasks]);

  // Summary Metrics calculations
  const summaryMetrics = useMemo(() => {
    const currentMonthPrefix = `${viewYear}-${(viewMonth + 1).toString().padStart(2, '0')}`;
    
    // Scheduled This Month
    const scheduledThisMonth = tasks.filter((t) => 
      t.dueDate && t.dueDate.startsWith(currentMonthPrefix)
    ).length;

    // In Progress
    const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;

    // Overdue: dueDate < todayStr AND status !== 'completed'
    const overdueCount = tasks.filter((t) => 
      t.dueDate && t.dueDate < todayStr && t.status !== 'completed'
    ).length;

    // Unscheduled
    const unscheduledCount = unscheduledTasks.length;

    return {
      scheduledThisMonth,
      inProgressCount,
      overdueCount,
      unscheduledCount
    };
  }, [tasks, unscheduledTasks, viewYear, viewMonth, todayStr]);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleToday = () => {
    const parsed = parseDateParts(todayStr);
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month - 1);
      setSelectedDate(todayStr);
    }
  };

  // Build calendar matrix (42 cells: 6 weeks x 7 days)
  const calendarCells = useMemo(() => {
    // First day of current month (0: Sun, 1: Mon, ...)
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    // Days in current month
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Days in previous month
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      tasks: FacilityTask[];
    }> = [];

    // Previous month filler days
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevMonthYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateStr = formatDateString(prevMonthYear, prevMonthIdx, day);
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        tasks: dateTaskMap.get(dateStr) || []
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = formatDateString(viewYear, viewMonth, day);
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        tasks: dateTaskMap.get(dateStr) || []
      });
    }

    // Next month filler days (fill up to 35 or 42 grid cells)
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const remaining = (7 - (cells.length % 7)) % 7;
    const totalSlots = cells.length + remaining < 35 ? 35 : cells.length + remaining;
    const neededNext = totalSlots - cells.length;

    for (let day = 1; day <= neededNext; day++) {
      const dateStr = formatDateString(nextMonthYear, nextMonthIdx, day);
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        tasks: dateTaskMap.get(dateStr) || []
      });
    }

    return cells;
  }, [viewYear, viewMonth, selectedDate, todayStr, dateTaskMap]);

  // Tasks on the selected date
  const selectedDayTasks = useMemo(() => {
    return dateTaskMap.get(selectedDate) || [];
  }, [dateTaskMap, selectedDate]);

  // Format human date label (e.g., "September 28, 2026")
  const formattedSelectedDate = useMemo(() => {
    const parts = parseDateParts(selectedDate);
    if (!parts) return selectedDate;
    return `${MONTH_NAMES[parts.month - 1]} ${parts.day}, ${parts.year}`;
  }, [selectedDate]);

  const getStatusBadge = (status: FacilityTask['status']) => {
    switch (status) {
      case 'in-progress':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider whitespace-nowrap">
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider whitespace-nowrap">
            Completed
          </span>
        );
      case 'on-hold':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider whitespace-nowrap">
            On Hold
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider whitespace-nowrap">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-[#00B86B] uppercase mb-1">
            Operations &amp; Dispatch
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-[#00B86B]" />
            <span>Facility Work Order Calendar</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#617070] mt-1 max-w-2xl">
            Coordinate scheduled maintenance, service work orders, and facility activity across the Northstar portfolio.
          </p>
        </div>

        {/* Action Header Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={fetchCalendarData}
            disabled={isLoading}
            className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-white border border-[#E1EBE7] text-[#063B35] hover:bg-[#F3F7F5] transition-colors flex items-center justify-center disabled:opacity-50 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
            title="Refresh calendar data from database"
            aria-label="Refresh calendar data from database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00B86B]' : ''}`} />
          </button>
          <Link
            to="/workspace/tasks"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E1EBE7] text-xs font-bold text-[#063B35] hover:border-[#00B86B] hover:bg-[#F3F7F5] transition-all min-h-[44px] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
          >
            <CheckSquare className="w-4 h-4 text-[#00B86B]" />
            <span>Work Order Console</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#617070]" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#E1EBE7] p-16 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 text-[#00B86B] animate-spin mx-auto" />
          <h3 className="font-bold text-[#063B35]">Loading Work Order Calendar...</h3>
          <p className="text-xs text-[#617070]">Synchronizing scheduled operations and commercial properties from Supabase.</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-red-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-red-800">Unable to Load Work Order Calendar</h3>
            <p className="text-xs text-red-600 max-w-md mx-auto mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={fetchCalendarData}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : (
        <>
          {/* 2. Compact Operational Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
              Scheduled This Month
            </div>
            <div className="text-2xl font-black text-[#063B35] mt-0.5">
              {summaryMetrics.scheduledThisMonth}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#00B86B]/10 text-[#063B35] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5 text-[#00B86B]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
              In Progress
            </div>
            <div className="text-2xl font-black text-blue-700 mt-0.5">
              {summaryMetrics.inProgressCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
              Overdue
            </div>
            <div className={`text-2xl font-black mt-0.5 ${summaryMetrics.overdueCount > 0 ? 'text-red-600' : 'text-[#063B35]'}`}>
              {summaryMetrics.overdueCount}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${summaryMetrics.overdueCount > 0 ? 'bg-red-50 text-red-600' : 'bg-[#F3F7F5] text-[#617070]'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
              Unscheduled
            </div>
            <div className="text-2xl font-black text-[#617070] mt-0.5">
              {summaryMetrics.unscheduledCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F3F7F5] text-[#617070] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#617070]" />
          </div>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E1EBE7] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-xl border border-[#E1EBE7] bg-[#F3F7F5] p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-2 rounded-lg text-[#063B35] hover:bg-white hover:shadow-2xs transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3.5 py-2 text-xs font-bold text-[#063B35] hover:bg-white rounded-lg transition-all min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-2 rounded-lg text-[#063B35] hover:bg-white hover:shadow-2xs transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-[#063B35] uppercase tracking-wide px-2">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
        </div>

        {/* Operational Filter Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <label htmlFor="calendar-status-filter" className="text-[#617070] font-bold text-[11px] uppercase tracking-wider hidden sm:inline">
              Status:
            </label>
            <select
              id="calendar-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-3 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl text-xs font-bold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          {/* Trade / Discipline Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <label htmlFor="calendar-trade-filter" className="text-[#617070] font-bold text-[11px] uppercase tracking-wider hidden sm:inline">
              Trade:
            </label>
            <select
              id="calendar-trade-filter"
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="h-11 px-3 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl text-xs font-bold text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] cursor-pointer"
            >
              <option value="all">All Trades</option>
              {availableTrades.map((category) => (
                <option key={category} value={category}>
                  {TRADE_LABELS[category] || category}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters pill if active */}
          {(statusFilter !== 'all' || tradeFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setTradeFilter('all');
              }}
              className="h-11 px-3 rounded-xl border border-dashed border-[#00B86B] text-[#063B35] hover:bg-[#00B86B]/10 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Interactive 7-Column Monthly Calendar Grid */}
      <div className="bg-white rounded-3xl border border-[#E1EBE7] shadow-xs overflow-hidden">
        {/* Day-of-Week Column Headers */}
        <div className="grid grid-cols-7 border-b border-[#E1EBE7] bg-[#F8FAF9] text-center">
          {WEEKDAY_NAMES.map((name, i) => (
            <div
              key={name}
              className={`py-3 text-[11px] font-extrabold uppercase tracking-wider ${
                i === 0 || i === 6 ? 'text-[#879B95]' : 'text-[#063B35]'
              }`}
            >
              <span className="hidden sm:inline">{name}</span>
              <span className="sm:hidden">{name.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* 7-Column Date Grid Matrix */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#E1EBE7] border-b border-[#E1EBE7]">
          {calendarCells.map((cell) => {
            const hasTasks = cell.tasks.length > 0;
            const isSelected = cell.isSelected;
            const isToday = cell.isToday;

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => setSelectedDate(cell.dateStr)}
                aria-label={`Select date ${cell.dateStr} with ${cell.tasks.length} work orders`}
                className={`min-h-[78px] sm:min-h-[110px] p-1.5 sm:p-2.5 text-left transition-colors flex flex-col justify-between relative group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00B86B] ${
                  isSelected
                    ? 'bg-[#EBF5F1] ring-2 ring-inset ring-[#00B86B]'
                    : cell.isCurrentMonth
                    ? 'bg-white hover:bg-[#F8FAF9]'
                    : 'bg-[#F9FBFB] text-slate-400 hover:bg-[#F3F7F5]'
                }`}
              >
                {/* Day Number Header */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`inline-flex items-center justify-center text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all ${
                      isToday
                        ? 'bg-[#063B35] text-white'
                        : isSelected
                        ? 'bg-[#00B86B] text-[#063B35]'
                        : cell.isCurrentMonth
                        ? 'text-[#063B35]'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Indicator count on mobile & compact views */}
                  {hasTasks && (
                    <span className="sm:hidden inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#00B86B] text-[#063B35] font-extrabold text-[10px]">
                      {cell.tasks.length}
                    </span>
                  )}
                </div>

                {/* Desktop Scheduled Task Indicators */}
                <div className="hidden sm:flex flex-col gap-1 w-full mt-1.5 overflow-hidden">
                  {cell.tasks.slice(0, 2).map((t) => {
                    const isHigh = t.priority === 'high' || t.priority === 'critical';
                    const isCompleted = t.status === 'completed';
                    const isOverdue = t.dueDate && t.dueDate < todayStr && !isCompleted;
                    const tradeShort = t.serviceCategory.replace('commercial-', '').replace('-services', '').replace('-maintenance', ' PM');

                    return (
                      <div
                        key={t.id}
                        title={`${t.id}: ${t.title} (${t.status})`}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border flex items-center justify-between ${
                          isCompleted
                            ? 'bg-slate-50 text-slate-500 border-slate-200 line-through opacity-75'
                            : isOverdue
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isHigh
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-[#F3F7F5] text-[#063B35] border-[#E1EBE7]'
                        }`}
                      >
                        <span className="font-mono font-bold">{t.id}</span>
                        <span className="text-[9px] uppercase tracking-wider text-[#617070] font-normal truncate ml-1">
                          {tradeShort}
                        </span>
                      </div>
                    );
                  })}

                  {cell.tasks.length > 2 && (
                    <div className="text-[10px] font-bold text-[#00B86B] pl-1">
                      +{cell.tasks.length - 2} more
                    </div>
                  )}
                </div>

                {/* Mobile Dot Indicator strip */}
                <div className="sm:hidden flex items-center gap-1 mt-auto pt-1">
                  {cell.tasks.slice(0, 3).map((t, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        t.status === 'completed'
                          ? 'bg-slate-400'
                          : t.priority === 'critical'
                          ? 'bg-red-500'
                          : 'bg-[#00B86B]'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Selected Day Agenda Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1EBE7] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E1EBE7]">
          <div>
            <div className="text-[11px] font-extrabold text-[#00B86B] uppercase tracking-wider">
              Work Orders &amp; Field Execution
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#063B35] uppercase tracking-tight">
              Work Orders — {formattedSelectedDate}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F3F7F5] text-[#063B35] border border-[#E1EBE7]">
              {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'Scheduled Order' : 'Scheduled Orders'}
            </span>
          </div>
        </div>

        {/* Selected Day Work Orders List */}
        {selectedDayTasks.length > 0 ? (
          <div className="space-y-4">
            {selectedDayTasks.map((task) => {
              const prop = task.propertyId ? propertyMap.get(task.propertyId) : undefined;
              const tradeName = TRADE_LABELS[task.serviceCategory] || task.serviceCategory;
              const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'completed';

              return (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] hover:border-[#00B86B]/60 transition-all space-y-3"
                >
                  {/* Top Work Order Meta Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#063B35] bg-white px-2.5 py-1 rounded-lg border border-[#E1EBE7] text-xs">
                        {task.id}
                      </span>
                      {getStatusBadge(task.status)}
                      {task.priority === 'critical' && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200 tracking-wider">
                          <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                          <span>EMERGENCY</span>
                        </span>
                      )}
                      {task.priority === 'high' && (
                        <span className="text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 tracking-wider">
                          HIGH PRIORITY
                        </span>
                      )}
                      {isOverdue && (
                        <span className="text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border bg-red-100 text-red-800 border-red-300 tracking-wider">
                          OVERDUE
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#00B86B]/15 text-[#063B35]">
                        {tradeName}
                      </span>
                    </div>

                    <div className="text-xs font-mono font-semibold text-[#617070]">
                      Target Due: {task.dueDate}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="font-bold text-[#063B35] text-base">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-[#617070] mt-1 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Property & Technician Metadata Strip */}
                  <div className="pt-3 border-t border-[#E1EBE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {/* Property Link */}
                    {prop ? (
                      <Link
                        to={`/workspace/properties/${prop.id}`}
                        className="inline-flex items-center gap-1.5 text-[#063B35] hover:text-[#00B86B] font-bold transition-colors group focus:outline-none focus:ring-1 focus:ring-[#00B86B] min-h-[44px]"
                      >
                        <Building2 className="w-4 h-4 text-[#00B86B]" />
                        <span>{prop.name}</span>
                        {prop.address && (
                          <span className="text-[11px] font-normal text-[#617070] hidden md:inline">
                            — {prop.address}
                          </span>
                        )}
                        <ArrowRight className="w-3 h-3 text-[#617070] group-hover:text-[#00B86B] group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-[#617070] min-h-[44px]">
                        <Building2 className="w-4 h-4 text-[#879B95]" />
                        <span>Unassigned Commercial Property</span>
                      </div>
                    )}

                    {/* Assigned Technician */}
                    <div className="flex items-center gap-2 text-[#063B35] font-semibold">
                      <User className="w-3.5 h-3.5 text-[#00B86B]" />
                      <span>{task.assignedTechnician || 'Unassigned Technician'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center space-y-2 rounded-2xl bg-[#F3F7F5] border border-dashed border-[#E1EBE7] p-6">
            <CalendarIcon className="w-8 h-8 text-[#879B95] mx-auto mb-1" />
            <h4 className="text-sm font-bold text-[#063B35] uppercase tracking-wider">
              No Work Orders Scheduled
            </h4>
            <p className="text-xs text-[#617070] max-w-sm mx-auto">
              No facility work is currently scheduled for {formattedSelectedDate}.
            </p>
          </div>
        )}
      </div>

      {/* 6. Unscheduled Work Orders Section (Secondary) */}
      {unscheduledTasks.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1EBE7] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E1EBE7]">
            <div>
              <h3 className="font-bold text-[#063B35] uppercase tracking-wider flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Unscheduled Work Orders</span>
              </h3>
              <p className="text-xs text-[#617070]">
                Tasks awaiting target service date allocation.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {unscheduledTasks.length} Pending Schedule
            </span>
          </div>

          <div className="space-y-3">
            {unscheduledTasks.map((task) => {
              const prop = task.propertyId ? propertyMap.get(task.propertyId) : undefined;
              const tradeName = TRADE_LABELS[task.serviceCategory] || task.serviceCategory;

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#063B35] bg-white px-2 py-0.5 rounded border border-[#E1EBE7]">
                        {task.id}
                      </span>
                      {getStatusBadge(task.status)}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00B86B]/15 text-[#063B35]">
                        {tradeName}
                      </span>
                    </div>
                    <div className="font-bold text-[#063B35]">{task.title}</div>
                    {prop && <div className="text-[11px] text-[#617070]">{prop.name}</div>}
                  </div>

                  <div className="flex items-center gap-2 text-[#617070]">
                    <User className="w-3.5 h-3.5 text-[#00B86B]" />
                    <span className="font-semibold text-[#063B35]">{task.assignedTechnician || 'Unassigned'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
};
