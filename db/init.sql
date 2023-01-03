SELECT 'CREATE DATABASE nestdb'
WHERE NOT EXISTS (
        SELECT
        FROM pg_database
        WHERE datname = 'nestdb'
    ) \ gexec