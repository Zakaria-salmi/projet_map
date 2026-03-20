#!/bin/bash
set -e

psql -U postgres -d postgres -a -f /data/seed.sql
echo "Db initialised successfully."

psql -U postgres -d postgres -c "COPY cities FROM '/data/cities.csv' DELIMITER ',' CSV HEADER;"
echo "Db seeded successfully"
