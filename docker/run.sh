#!/bin/sh

# Transcribe environment...
cat <<EOF >> .env.local

    # Auto-generated on docker container creation.
    VUE_APP_OCS_ADDRS="${OCS_ADDRS}"
EOF

# Run development server...
PORT=${PORT:=8080}
HOST=${HOST:=0.0.0.0}
npm run serve -- --port $PORT --host $HOST
