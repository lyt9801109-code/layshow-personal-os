-- LAYSHOW ZONE — 個人優化系統 3 張表 migration
-- ============================================
-- 用途：行事曆 / 記帳 / 里程
-- 林逸霆專用個人 OS 資料層

-- 1. 個人行事曆 / 行程
CREATE TABLE IF NOT EXISTS public.personal_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    event_date date NOT NULL,
    event_time time,
    duration_minutes int DEFAULT 60,
    location text,
    category text DEFAULT 'general',   -- general/work/customer/b2b/personal/family/health
    remind_minutes_before int DEFAULT 30,
    reminded boolean DEFAULT false,
    status text DEFAULT 'pending',     -- pending/done/cancelled
    google_cal_synced boolean DEFAULT false,
    customer_name text,                -- 若是客戶相關
    customer_phone text,
    note text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.personal_events(event_date, event_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.personal_events(status);

-- 2. 記帳
CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    amount numeric NOT NULL,
    expense_type text DEFAULT 'expense',  -- expense / income
    category text NOT NULL,               -- 油錢/材料/工具/工資/食物/設備/B2B/雜支/客戶招待/收入
    description text,
    expense_date date NOT NULL DEFAULT CURRENT_DATE,
    payment_method text,                  -- 現金/信用卡/LINE Pay/轉帳/支票
    receipt_photo_url text,
    customer_name text,
    project_name text,                    -- 關聯哪場工程
    tax_deductible boolean DEFAULT false, -- 是否可抵稅
    note text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_cat ON public.expenses(category);

-- 3. 里程
CREATE TABLE IF NOT EXISTS public.mileage_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_date date NOT NULL DEFAULT CURRENT_DATE,
    start_time timestamptz,
    end_time timestamptz,
    start_location text,
    end_location text,
    start_km numeric,
    end_km numeric,
    distance_km numeric,
    purpose text,                         -- 工程/拜訪客戶/採購材料/B2B/個人/其他
    customer_name text,
    fuel_cost numeric,
    toll_cost numeric,
    parking_cost numeric,
    note text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mileage_date ON public.mileage_logs(trip_date DESC);

-- RLS
ALTER TABLE public.personal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mileage_logs ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
DECLARE t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['personal_events', 'expenses', 'mileage_logs']
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "all for sr" ON public.%I', t);
        EXECUTE format('CREATE POLICY "all for sr" ON public.%I AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true)', t);
        EXECUTE format('DROP POLICY IF EXISTS "all for anon" ON public.%I', t);
        EXECUTE format('CREATE POLICY "all for anon" ON public.%I AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;

-- 驗證
SELECT 'ZONE 3 張表已建好 ✅' as message,
       (SELECT count(*) FROM information_schema.tables WHERE table_name IN ('personal_events', 'expenses', 'mileage_logs')) as table_count;
