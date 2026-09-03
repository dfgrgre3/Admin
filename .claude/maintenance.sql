BEGIN;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_prisma_migrations') THEN
    IF NOT EXISTS (SELECT 1 FROM _prisma_migrations) THEN
      DROP TABLE _prisma_migrations;
    END IF;
  END IF;
END
$$;
COMMIT;
VACUUM (ANALYZE) roles;
VACUUM (ANALYZE) "UserSession";
