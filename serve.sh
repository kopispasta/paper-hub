#!/bin/bash
# TelaahSains Hub: Launcher & Local Server
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
PORT=8080

# Check if port is already running
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo "Server lokal TelaahSains sudah aktif di http://localhost:$PORT"
  open "http://localhost:$PORT"
  exit 0
fi

echo "Memulai server lokal TelaahSains di http://localhost:$PORT ..."
echo "Tekan Ctrl+C untuk menghentikan server."
python3 -m http.server $PORT --directory "$DIR" &
SERVER_PID=$!

sleep 1
open "http://localhost:$PORT"

trap "kill $SERVER_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait $SERVER_PID
