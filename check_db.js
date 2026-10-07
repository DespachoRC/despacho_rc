const { spawnSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { unlinkSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');

const projectRef = 'vktamttoqdqfbvqlvnxj';
const query = `
SELECT jsonb_build_object(
  'columns', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'table', table_name,
      'column', column_name,
      'type', data_type,
      'nullable', is_nullable,
      'default', column_default
    ) ORDER BY table_name, ordinal_position), '[]'::jsonb)
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ANY(ARRAY[
        'cotizaciones', 'actividades', 'lista_actividades',
        'catalogo_actividades', 'usuarios',
        'estatus_cotizacion', 'estatus_actividad'
      ])
  ),
  'foreign_keys', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'table', tc.table_name,
      'column', kcu.column_name,
      'referenced_table', ccu.table_name,
      'referenced_column', ccu.column_name
    ) ORDER BY tc.table_name, kcu.column_name), '[]'::jsonb)
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_catalog = kcu.constraint_catalog
     AND tc.constraint_schema = kcu.constraint_schema
     AND tc.constraint_name = kcu.constraint_name
     AND tc.table_name = kcu.table_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON tc.constraint_catalog = ccu.constraint_catalog
     AND tc.constraint_schema = ccu.constraint_schema
     AND tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = ANY(ARRAY[
        'cotizaciones', 'actividades', 'lista_actividades'
      ])
  ),
  'policies', (
    SELECT coalesce(jsonb_agg(to_jsonb(policy) ORDER BY tablename, policyname), '[]'::jsonb)
    FROM pg_policies AS policy
    WHERE schemaname = 'public'
      AND tablename = ANY(ARRAY['cotizaciones', 'actividades'])
  ),
  'quotation_triggers', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'name', trigger_data.tgname,
      'trigger_definition', pg_get_triggerdef(trigger_data.oid, true),
      'function_definition', pg_get_functiondef(function_data.oid)
    ) ORDER BY trigger_data.tgname), '[]'::jsonb)
    FROM pg_trigger AS trigger_data
    JOIN pg_class AS relation_data ON relation_data.oid = trigger_data.tgrelid
    JOIN pg_namespace AS namespace_data ON namespace_data.oid = relation_data.relnamespace
    JOIN pg_proc AS function_data ON function_data.oid = trigger_data.tgfoid
    WHERE namespace_data.nspname = 'public'
      AND relation_data.relname = 'cotizaciones'
      AND NOT trigger_data.tgisinternal
  )
) AS schema_inspection;
`;

const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const queryFile = join(tmpdir(), `despacho-supabase-schema-${randomUUID()}.sql`);
let result;

try {
  writeFileSync(queryFile, query, { flag: 'wx' });
  result = spawnSync(
    executable,
    [
      '--yes',
      'supabase',
      'db',
      'query',
      '--linked',
      '--project-ref',
      projectRef,
      '--file',
      queryFile,
    ],
    {
      encoding: 'utf8',
      shell: process.platform === 'win32',
      windowsHide: true,
    }
  );
} catch (error) {
  console.error(`Could not prepare the schema inspection query: ${error.message}`);
  process.exitCode = 1;
} finally {
  try {
    unlinkSync(queryFile);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Could not remove the temporary SQL file: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

if (result) {
  if (result.error) {
    console.error(`Could not run Supabase CLI: ${result.error.message}`);
    process.exitCode = 1;
  } else {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status !== 0) process.exitCode = result.status ?? 1;
  }
}
