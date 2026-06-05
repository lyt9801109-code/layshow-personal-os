-- LAYSHOW 爬蟲客戶池表（Supabase SQL Editor 跑一次即可）
-- ====================================================
CREATE TABLE IF NOT EXISTS public.crawler_hits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    platform text NOT NULL,           -- 'FB社團' / 'Threads' / 'PTT' / 'FB搜尋'
    post_url text NOT NULL,
    post_title text,
    post_text text,                   -- 客戶貼文內容節錄
    keyword text,                     -- 命中關鍵字
    comment_left text,                -- 我留了什麼
    status text DEFAULT 'pending',    -- pending / contacted / closed / ignored
    notes text,                       -- 跟進備註
    contacted_at timestamptz,
    closed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 索引（依時間倒序）
CREATE INDEX IF NOT EXISTS idx_crawler_hits_created ON public.crawler_hits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawler_hits_status ON public.crawler_hits(status);

-- RLS 開（service_role 自由讀寫，anon 也允許讀+寫狀態）
ALTER TABLE public.crawler_hits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for service role" ON public.crawler_hits;
CREATE POLICY "Allow all for service role" ON public.crawler_hits
    AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for anon" ON public.crawler_hits;
CREATE POLICY "Allow all for anon" ON public.crawler_hits
    AS PERMISSIVE FOR ALL TO anon USING (true) WITH CHECK (true);

-- 測試查詢
SELECT count(*) FROM public.crawler_hits;
