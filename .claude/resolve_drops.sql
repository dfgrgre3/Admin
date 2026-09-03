-- ============ ITERATIVE SAFE DROP RESOLVER ============
DROP TABLE IF EXISTS tmp_idx, tmp_drops;
CREATE TEMP TABLE tmp_idx AS
SELECT t.oid tid, t.relname tbl, i.relname iname,
       x.indkey::text cols, x.indclass::text ic, x.indnatts,
       x.indisunique, x.indisprimary,
       coalesce(x.indpred::text,'') pred,
       coalesce(ci.conname,'') con,
       pg_get_indexdef(i.oid) def,
       pg_relation_size(i.oid) sz,
       false marked
FROM pg_index x
JOIN pg_class i ON i.oid = x.indexrelid
JOIN pg_class t ON t.oid = x.indrelid
JOIN pg_namespace nn ON nn.oid = t.relnamespace
LEFT JOIN pg_constraint ci ON ci.conindid = i.oid
WHERE nn.nspname = 'public'
  -- never treat partition-attached child indexes as candidates: they follow their parent
  AND NOT EXISTS (SELECT 1 FROM pg_inherits ih WHERE ih.inhrelid = t.oid);

CREATE TEMP TABLE tmp_drops (tbl text, iname text, uniq bool, partial bool, keeper text);

DO $$
DECLARE
  new_count int := 0;
  iteration int := 0;
  r record;
  keeper_name text;
BEGIN
  LOOP
    iteration := iteration + 1;
    new_count := 0;
    FOR r IN
      SELECT c.tbl, c.iname, c.indisunique AS d_uniq, c.tid, c.cols, c.ic, c.indnatts, c.pred,
             (c.pred <> '') AS d_partial
      FROM tmp_idx c
      WHERE NOT c.marked AND NOT c.indisprimary AND c.con = ''
    LOOP
      SELECT k.iname INTO keeper_name
      FROM tmp_idx k
      WHERE k.tid = r.tid AND k.cols = r.cols AND k.ic = r.ic AND k.indnatts = r.indnatts
        AND NOT k.marked AND k.iname <> r.iname
        AND (k.pred = '' OR k.pred = r.pred)
        AND k.indisunique >= r.d_uniq
      ORDER BY (CASE WHEN k.indisprimary THEN 100 ELSE 0 END
               + CASE WHEN k.con <> '' THEN 50 ELSE 0 END
               + CASE WHEN k.indisunique THEN 10 ELSE 0 END
               + CASE WHEN k.pred = '' THEN 5 ELSE 0 END) DESC,
               k.iname
      LIMIT 1;
      IF keeper_name IS NOT NULL THEN
        INSERT INTO tmp_drops VALUES (r.tbl, r.iname, r.d_uniq, r.d_partial, keeper_name);
        UPDATE tmp_idx SET marked = true WHERE tid = r.tid AND iname = r.iname;
        new_count := new_count + 1;
      END IF;
      keeper_name := NULL;
    END LOOP;
    EXIT WHEN new_count = 0;
  END LOOP;
  RAISE NOTICE 'iterations: %, total drops: %', iteration, (SELECT count(*) FROM tmp_drops);
END $$;

-- final safety assertion: every dropped index has a SURVIVING dominator
SELECT count(*) AS unsafe FROM tmp_drops d
WHERE NOT EXISTS (
  SELECT 1 FROM tmp_idx k
  WHERE k.tid = (SELECT tid FROM tmp_idx i WHERE i.iname = d.iname AND i.tbl = d.tbl LIMIT 1)
    AND NOT k.marked
    AND k.iname <> d.iname
    AND k.cols = (SELECT cols FROM tmp_idx i WHERE i.iname = d.iname AND i.tbl = d.tbl LIMIT 1)
    AND k.ic   = (SELECT ic   FROM tmp_idx i WHERE i.iname = d.iname AND i.tbl = d.tbl LIMIT 1)
    AND k.indnatts = (SELECT indnatts FROM tmp_idx i WHERE i.iname = d.iname AND i.tbl = d.tbl LIMIT 1)
    AND (k.pred = '' OR k.pred = (SELECT pred FROM tmp_idx i WHERE i.iname = d.iname AND i.tbl = d.tbl LIMIT 1))
    AND k.indisunique >= (SELECT indisunique FROM tmp_idx i WHERE i.iname = d.iname AND i.tbl = d.tbl LIMIT 1)
);

SELECT tbl, iname, uniq, partial, keeper FROM tmp_drops ORDER BY tbl, iname;
