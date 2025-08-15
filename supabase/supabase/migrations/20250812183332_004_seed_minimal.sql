BEGIN;

-- Minimal idempotent seed for departments and services
insert into public.departments (id, code, name)
values
  (gen_random_uuid(), 'IMMIG', 'Immigration & Emigration'),
  (gen_random_uuid(), 'MOT', 'Motor Traffic Department')
on conflict (code) do nothing;

insert into public.services (id, department_id, code, name)
select gen_random_uuid(), d.id, s.code, s.name
from (
  values
    ('IMMIG', 'PASSPORT_NEW', 'New Passport Application'),
    ('IMMIG', 'PASSPORT_RENEW', 'Passport Renewal'),
    ('MOT', 'LIC_NEW', 'New Driving License'),
    ('MOT', 'LIC_RENEW', 'Driving License Renewal')
) as s(dept_code, code, name)
join public.departments d on d.code = s.dept_code
on conflict (code) do nothing;

COMMIT;

