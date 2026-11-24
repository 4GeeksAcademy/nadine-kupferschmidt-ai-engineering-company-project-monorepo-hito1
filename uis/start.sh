#!/bin/sh

# Arranca talent-pipeline-tracker en el puerto 3000, en segundo plano, desde su carpeta
(cd /uis/talent-pipeline-tracker && npm run dev -- -p 3000 -H 0.0.0.0) &

# Arranca backoffice en el puerto 3001, en segundo plano, desde su carpeta
(cd /uis/backoffice && npm run dev -- -p 3001 -H 0.0.0.0) &

# Espera a los procesos en segundo plano para que el contenedor siga vivo
wait
