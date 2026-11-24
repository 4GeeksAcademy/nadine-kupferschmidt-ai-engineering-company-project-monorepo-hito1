# Imagen base oficial de Node.js 22 sobre Alpine
FROM node:22-alpine

# Define /uis como directorio de trabajo
WORKDIR /uis

# Copia solo package.json y package-lock.json de talent-pipeline-tracker para cachear sus dependencias
COPY talent-pipeline-tracker/package.json talent-pipeline-tracker/package-lock.json ./talent-pipeline-tracker/

# Instala las dependencias exactas de talent-pipeline-tracker desde el lockfile
RUN cd talent-pipeline-tracker && npm ci

# Copia solo package.json y package-lock.json de backoffice para cachear sus dependencias
COPY backoffice/package.json backoffice/package-lock.json ./backoffice/

# Instala las dependencias exactas de backoffice desde el lockfile
RUN cd backoffice && npm ci

# Copia el resto del código de uis/ a /uis
COPY . .

# Documenta los puertos de las dos apps: talent-pipeline-tracker (3000) y backoffice (3001)
EXPOSE 3000 3001

# Arranca ambas apps en modo desarrollo con el script de inicio
CMD ["sh", "./start.sh"]
