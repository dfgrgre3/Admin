ALTER TABLE public."TopicProgress" DROP CONSTRAINT unique_user_lesson_snake;
SELECT r1.rolname AS member, r2.rolname AS granted_role
FROM pg_auth_members m
JOIN pg_roles r1 ON r1.oid = m.member
JOIN pg_roles r2 ON r2.oid = m.roleid
WHERE r2.rolname = 'app_user';
