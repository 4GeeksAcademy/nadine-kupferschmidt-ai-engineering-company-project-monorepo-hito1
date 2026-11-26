# Imagen base oficial de Node.js 22 sobre Alpine
FROM node:22-alpine

# Define /uis como directorio de trabajo
WORKDIR /uis

# Copia solo package.json y package-lock.json de website para cachear sus dependencias
COPY website/package.json website/package-lock.json ./website/

# Instala las dependencias exactas de website desde el lockfile
RUN cd website && npm ci

# Copia solo package.json y package-lock.json de backoffice para cachear sus dependencias
COPY backoffice/package.json backoffice/package-lock.json ./backoffice/

# Instala las dependencias exactas de backoffice desde el lockfile
RUN cd backoffice && npm ci

# Copia solo package.json y package-lock.json de talent-pipeline-tracker para cachear sus dependencias
COPY talent-pipeline-tracker/package.json talent-pipeline-tracker/package-lock.json ./talent-pipeline-tracker/

# Instala las dependencias exactas de talent-pipeline-tracker desde el lockfile
RUN cd talent-pipeline-tracker && npm ci

# Copia el resto del código de uis/ a /uis
COPY . .

# Documenta los puertos de las tres apps: website (3000), backoffice (3001) y talent-pipeline-tracker (3002)
EXPOSE 3000 3001 3002

# Arranca las tres apps en modo desarrollo con el script de inicio
CMD ["sh", "./start.sh"]
