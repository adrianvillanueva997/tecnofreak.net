#!/bin/bash
set -e
# Creates limited cms role using POSTGRES_PASSWORD from environment
# This script is executed by postgres entrypoint on first init (when data dir is empty)

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO \$\$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'cms') THEN
        CREATE ROLE cms NOSUPERUSER NOCREATEDB NOCREATEROLE LOGIN PASSWORD '$POSTGRES_PASSWORD';
      END IF;
    END
    \$\$;
    GRANT CONNECT ON DATABASE tecnofreak TO cms;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "tecnofreak" <<-EOSQL
    GRANT USAGE ON SCHEMA public TO cms;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO cms;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO cms;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO cms;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO cms;
EOSQL
