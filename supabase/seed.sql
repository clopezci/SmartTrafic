-- Demo tenant. Does not create auth users (those are created in the dashboard).
-- Safe to re-run: uses fixed UUIDs.

insert into public.municipalities (
  id, name, department, country, population, plan, monthly_fee_cop,
  contract_start, contract_end, lat, lng, settings
) values (
  '11111111-1111-1111-1111-111111111111',
  'El Carmen de Viboral',
  'Antioquia',
  'CO',
  62000,
  'premium',
  1500000,
  current_date - 40,
  current_date + 320,
  6.0828,
  -75.3352,
  '{
    "nightAntiCrime": true,
    "motoFirst": true,
    "solarEco": true,
    "floorLights": true,
    "acoustic": true,
    "emergencyPreempt": true
  }'::jsonb
)
on conflict (id) do update set
  name = excluded.name,
  department = excluded.department,
  population = excluded.population,
  lat = excluded.lat,
  lng = excluded.lng,
  settings = excluded.settings;

insert into public.municipalities (
  id, name, department, country, population, plan, monthly_fee_cop,
  contract_start, contract_end, lat, lng
) values (
  '11111111-1111-1111-1111-111111111112',
  'Puerto Cedro',
  'Meta',
  'CO',
  18500,
  'adaptativo',
  1200000,
  current_date - 20,
  current_date + 340,
  4.1500,
  -73.6400
)
on conflict (id) do update set name = excluded.name;

-- If a previous seed used Villa Esperanza, rename leftover demo emails.
update public.field_technicians
  set email = replace(email, '@villaesperanza.gov.co', '@carmendeviboral.gov.co')
  where email like '%@villaesperanza.gov.co';
update public.credential_overrides
  set email = replace(email, '@villaesperanza.gov.co', '@carmendeviboral.gov.co')
  where email like '%@villaesperanza.gov.co';
update public.display_names
  set email = replace(email, '@villaesperanza.gov.co', '@carmendeviboral.gov.co')
  where email like '%@villaesperanza.gov.co';
update public.access_grants
  set email = replace(email, '@villaesperanza.gov.co', '@carmendeviboral.gov.co')
  where email like '%@villaesperanza.gov.co';
update public.timing_profiles
  set name = 'Perfil adaptativo El Carmen de Viboral'
  where municipality_id = '11111111-1111-1111-1111-111111111111';
update public.alerts
  set title = replace(title, 'Hospital', 'Cementerio')
  where municipality_id = '11111111-1111-1111-1111-111111111111'
    and title like '%Hospital%';

insert into public.intersections (
  id, municipality_id, code, name, geometry, lat, lng, approaches, plan, mode,
  online, health_score, solar, battery_pct, firmware_version, last_heartbeat_at
) values
(
  '22222222-2222-2222-2222-222222222221',
  '11111111-1111-1111-1111-111111111111',
  'CR-01',
  'Parque Central',
  'plus', 6.0828, -75.3352, 4, 'premium', 'normal',
  true, 98, true, 87.5, 'edge-0.9.1', now() - interval '8 seconds'
),
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'CR-02',
  'Ospina',
  't', 6.0795, -75.3388, 3, 'adaptativo', 'school',
  true, 94, true, 72.0, 'edge-0.9.1', now() - interval '12 seconds'
),
(
  '22222222-2222-2222-2222-222222222223',
  '11111111-1111-1111-1111-111111111111',
  'CR-03',
  'Estadio',
  'plus', 6.0862, -75.3315, 4, 'adaptativo', 'normal',
  true, 88, true, 64.0, 'edge-0.9.1', now() - interval '22 seconds'
),
(
  '22222222-2222-2222-2222-222222222224',
  '11111111-1111-1111-1111-111111111111',
  'CR-04',
  'Cementerio',
  'pedestrian', 6.0768, -75.3405, 2, 'premium', 'eco',
  false, 54, true, 18.0, 'edge-0.8.4', now() - interval '16 minutes'
),
(
  '22222222-2222-2222-2222-222222222225',
  '11111111-1111-1111-1111-111111111111',
  'CR-05',
  'Circunvalar',
  'plus', 6.0895, -75.3278, 4, 'adaptativo', 'normal',
  true, 81, true, 41.0, 'edge-0.9.0', now() - interval '40 seconds'
),
(
  '22222222-2222-2222-2222-222222222226',
  '11111111-1111-1111-1111-111111111111',
  'CR-06',
  'San Fernando',
  'plus', 6.0848, -75.3422, 4, 'adaptativo', 'night',
  true, 91, true, 76.0, 'edge-0.9.1', now() - interval '15 seconds'
)
on conflict (id) do update set
  name = excluded.name,
  geometry = excluded.geometry,
  lat = excluded.lat,
  lng = excluded.lng,
  approaches = excluded.approaches,
  plan = excluded.plan,
  health_score = excluded.health_score,
  battery_pct = excluded.battery_pct,
  mode = excluded.mode,
  online = excluded.online;

insert into public.approaches (id, intersection_id, name, heading_deg)
values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222221', 'Carrera 30 Norte', 0),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222221', 'Parque Este', 90),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222221', 'Carrera 30 Sur', 180),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222221', 'Parque Oeste', 270),
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222222', 'Calle 32 Norte', 0),
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222222', 'Frente colegio Ospina', 90),
  ('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222222', 'Calle 32 Sur', 180),
  ('33333333-3333-3333-3333-333333333308', '22222222-2222-2222-2222-222222222223', 'Avenida Estadio Norte', 0),
  ('33333333-3333-3333-3333-333333333309', '22222222-2222-2222-2222-222222222223', 'Acceso tribuna', 90),
  ('33333333-3333-3333-3333-333333333310', '22222222-2222-2222-2222-222222222223', 'Avenida Estadio Sur', 180),
  ('33333333-3333-3333-3333-333333333311', '22222222-2222-2222-2222-222222222223', 'Calle lateral', 270),
  ('33333333-3333-3333-3333-333333333312', '22222222-2222-2222-2222-222222222224', 'Calle Cementerio', 90),
  ('33333333-3333-3333-3333-333333333313', '22222222-2222-2222-2222-222222222224', 'Sentido contrario', 270),
  ('33333333-3333-3333-3333-333333333314', '22222222-2222-2222-2222-222222222225', 'Circunvalar entrada', 0),
  ('33333333-3333-3333-3333-333333333315', '22222222-2222-2222-2222-222222222225', 'Calle 20 Este', 90),
  ('33333333-3333-3333-3333-333333333316', '22222222-2222-2222-2222-222222222225', 'Circunvalar salida', 180),
  ('33333333-3333-3333-3333-333333333317', '22222222-2222-2222-2222-222222222225', 'Calle 20 Oeste', 270),
  ('33333333-3333-3333-3333-333333333318', '22222222-2222-2222-2222-222222222226', 'San Fernando Norte', 0),
  ('33333333-3333-3333-3333-333333333319', '22222222-2222-2222-2222-222222222226', 'Calle 28 Este', 90),
  ('33333333-3333-3333-3333-333333333320', '22222222-2222-2222-2222-222222222226', 'San Fernando Sur', 180),
  ('33333333-3333-3333-3333-333333333321', '22222222-2222-2222-2222-222222222226', 'Calle 28 Oeste', 270)
on conflict (id) do update set name = excluded.name;

insert into public.devices (id, municipality_id, intersection_id, kind, serial, owner, label)
values
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'edge_brain', 'ST-BRN-0001', 'smarttrafic', 'Cerebro CR-01'),
  ('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'modem_4g', 'ST-MDM-0001', 'smarttrafic', 'Módem 4G CR-01'),
  ('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'camera_ai', 'ST-CAM-0001', 'smarttrafic', 'Cámara IA Norte'),
  ('44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'esp32_satellite', 'ST-ESP-0004', 'smarttrafic', 'Satélite Oeste'),
  ('44444444-4444-4444-4444-444444444405', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'floor_led', 'MUN-FLR-01', 'municipality', 'Barra piso peatonal E'),
  ('44444444-4444-4444-4444-444444444406', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'acoustic', 'MUN-AUD-01', 'municipality', 'Audio invidentes E')
on conflict (id) do nothing;

insert into public.timing_profiles (municipality_id, intersection_id, name)
values ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'Perfil adaptativo El Carmen de Viboral')
on conflict do nothing;

insert into public.system_settings (key, value, municipality_id)
values
  ('telegram.enabled', 'true'::jsonb, null),
  ('health.reportHour', '7'::jsonb, null),
  ('feature.motoFirst', 'true'::jsonb, null),
  ('feature.nightAntiCrime', 'true'::jsonb, null),
  ('feature.solarEco', 'true'::jsonb, null),
  ('feature.emergencyPreempt', 'true'::jsonb, null),
  ('ingest.requireHmac', 'true'::jsonb, null)
on conflict do nothing;

insert into public.alerts (municipality_id, intersection_id, severity, code, title, body)
values
(
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222224',
  'critical',
  'BATTERY_LOW',
  'Cementerio en modo Eco — batería 18%',
  'Tres días nublados. El cruce degradó peatonal auxiliar y priorizó vehiculares. Revisar banco de baterías.'
),
(
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222224',
  'warning',
  'HEARTBEAT_MISS',
  'Sin heartbeat hace 16 min',
  'El módem 4G no reporta. El edge sigue en local (fail-safe ámbar si pierde conflicto).'
)
on conflict do nothing;

insert into public.health_events (source, level, message, fingerprint, context)
values
  ('api', 'info', 'Ingesta MQTT saludable', 'mqtt.ok', '{"ok":true}'::jsonb),
  ('edge', 'warning', 'CR-04 heartbeat delayed', 'hb.CR-04', '{"minutes":16}'::jsonb);

insert into public.health_heartbeats (component, ok, latency_ms, detail)
values
  ('supabase', true, 42, '{"region":"sa-east-1"}'::jsonb),
  ('vercel', true, 18, '{"env":"production"}'::jsonb),
  ('telegram', true, 120, '{"bot":"configured"}'::jsonb),
  ('mqtt', true, 35, '{"broker":"pending"}'::jsonb);

insert into public.audit_events (actor_email, municipality_id, action, entity, entity_id, diff)
values
  ('clpezci@gmail.com', null, 'platform.bootstrap', 'system', 'fase-1', '{"note":"esquema inicial"}'::jsonb);

insert into public.field_technicians (id, municipality_id, full_name, email, phone, status, assigned_codes)
values
  (
    '55555555-5555-5555-5555-555555555501',
    '11111111-1111-1111-1111-111111111111',
    'Laura Méndez',
    'tecnico@carmendeviboral.gov.co',
    '+57 310 555 0198',
    'disponible',
    '{CR-01,CR-02,CR-03}'
  ),
  (
    '55555555-5555-5555-5555-555555555502',
    '11111111-1111-1111-1111-111111111111',
    'Andrés Pineda',
    'andres.pineda@carmendeviboral.gov.co',
    '+57 312 444 7710',
    'en_ruta',
    '{CR-04,CR-05,CR-06}'
  )
on conflict (municipality_id, email) do update
  set status = excluded.status, assigned_codes = excluded.assigned_codes, full_name = excluded.full_name;

insert into public.kpi_daily (
  day, municipality_id, wait_drop_pct, fuel_saved_gal, co2_tons, motos, trucks_3axle, uptime_pct
) values (
  current_date,
  '11111111-1111-1111-1111-111111111111',
  28, 186, 1.7, 12840, 412, 99.2
)
on conflict (municipality_id, day) do update set
  wait_drop_pct = excluded.wait_drop_pct,
  fuel_saved_gal = excluded.fuel_saved_gal,
  motos = excluded.motos;
