-- ============ SAFE DUPLICATE INDEX DROP LIST ============
WITH idx AS (
  SELECT t.oid tid, t.relname tbl, i.relname iname,
         x.indkey::text cols, x.indclass::text ic, x.indnatts,
         x.indisunique, x.indisprimary,
         coalesce(x.indpred::text,'') pred,
         coalesce(ci.conname,'') con,
         pg_get_indexdef(i.oid) def,
         pg_relation_size(i.oid) sz
  FROM pg_index x
  JOIN pg_class i ON i.oid = x.indexrelid
  JOIN pg_class t ON t.oid = x.indrelid
  JOIN pg_namespace nn ON nn.oid = t.relnamespace
  LEFT JOIN pg_constraint ci ON ci.conindid = i.oid
  WHERE nn.nspname = 'public'
),
-- best keeper inside the exact-predicate group
keeper_same AS (
  SELECT DISTINCT ON (tid, cols, ic, indnatts, pred)
         tid, cols, ic, indnatts, pred, iname,
         (CASE WHEN indisprimary THEN 100 ELSE 0 END
        + CASE WHEN con<>'' THEN 50 ELSE 0 END
        + CASE WHEN indisunique THEN 10 ELSE 0 END
        + CASE WHEN pred='' THEN 5 ELSE 0 END
        + CASE WHEN sz>0 THEN 1 ELSE 0 END) prio, indisunique
  FROM idx
  ORDER BY tid, cols, ic, indnatts, pred,
           (CASE WHEN indisprimary THEN 100 ELSE 0 END
          + CASE WHEN con<>'' THEN 50 ELSE 0 END
          + CASE WHEN indisunique THEN 10 ELSE 0 END
          + CASE WHEN pred='' THEN 5 ELSE 0 END
          + CASE WHEN sz>0 THEN 1 ELSE 0 END) DESC, iname
),
-- best keeper among full indexes (dominates any partial)
keeper_full AS (
  SELECT DISTINCT ON (tid, cols, ic, indnatts)
         tid, cols, ic, indnatts, iname,
         (CASE WHEN indisprimary THEN 100 ELSE 0 END
        + CASE WHEN con<>'' THEN 50 ELSE 0 END
        + CASE WHEN indisunique THEN 10 ELSE 0 END
        + 5) prio, indisunique
  FROM idx
  WHERE pred=''
  ORDER BY tid, cols, ic, indnatts,
           (CASE WHEN indisprimary THEN 100 ELSE 0 END
          + CASE WHEN con<>'' THEN 50 ELSE 0 END
          + CASE WHEN indisunique THEN 10 ELSE 0 END
          + 5) DESC, iname
),
candidates AS (
  SELECT x.* FROM idx x
  WHERE NOT x.indisprimary AND x.con=''
)
SELECT c.tbl, c.iname AS to_drop, c.indisunique AS drop_uniq, c.pred <> '' AS drop_partial,
       COALESCE(ks.iname, kf.iname) AS keeper, COALESCE(ks.prio, kf.prio) AS keeper_prio
FROM candidates c
LEFT JOIN keeper_same ks
       ON ks.tid=c.tid AND ks.cols=c.cols AND ks.ic=c.ic AND ks.indnatts=c.indnatts
      AND ks.pred=c.pred AND ks.iname <> c.iname
LEFT JOIN keeper_full kf
       ON ks.iname IS NULL AND kf.tid=c.tid AND kf.cols=c.cols AND kf.ic=c.ic
      AND kf.indnatts=c.indnatts AND kf.iname <> c.iname AND c.pred <> ''
WHERE COALESCE(ks.indisunique, kf.indisunique) >= c.indisunique
ORDER BY c.tbl, c.iname;
