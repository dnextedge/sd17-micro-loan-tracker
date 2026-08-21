# Database migrations

Timestamped migrations in this directory are the source of truth for the
Supabase PostgreSQL schema. Apply them locally with `npm run db:reset` before
linking or pushing them to a hosted project.

Money is represented as `BIGINT` integer minor units (kobo), never JavaScript or
PostgreSQL floating-point values. For example, ₦120,000 is stored as `12000000`.
