# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy all workspace packages (needed for pnpm install with workspace protocol)
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/mockup-sandbox/ ./artifacts/mockup-sandbox/
COPY scripts/ ./scripts/
COPY tsconfig.base.json tsconfig.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the API server
RUN pnpm --filter @workspace/api-server build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm for workspace resolution
RUN npm install -g pnpm@9

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY lib/ ./lib/
COPY artifacts/api-server/package.json ./artifacts/api-server/package.json
COPY scripts/package.json ./scripts/package.json

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built output from builder
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

WORKDIR /app/artifacts/api-server

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
