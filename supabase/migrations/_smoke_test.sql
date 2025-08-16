-- Simple smoke test queries to verify schema after migrations
select 'departments' as table, count(*) as rows from public.departments;
select 'services' as table, count(*) as rows from public.services;
-- join sanity
select d.code as dept, s.code as service
from public.services s
join public.departments d on d.id = s.department_id
order by d.code, s.code
limit 10;

