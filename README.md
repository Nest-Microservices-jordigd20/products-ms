
# Products Microservice

## Development environment

1. Clonate the repository 
2. Install the dependencies
3. Create a `.env` based on the `.env.example` file.
4. Synchronize the database with prisma `npx prisma migrate dev`
5. Run the application


## Production environment

Run the following command to build the Docker image:
```bash
docker build -f Dockerfile.prod -t products-ms .
```

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```