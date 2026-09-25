#!/bin/bash
# Skrip pembuka cepat portal paper-hub di Mac

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
echo "Membuka Portal Telaah Sains di browser default..."
open "$DIR/index.html"
