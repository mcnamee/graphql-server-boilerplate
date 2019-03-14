# GraphQL Server Boilerplate

A boilerplate GraphQL server with:

- [GraphQL Yoga](https://github.com/prisma/graphql-yoga) for a Scalable GraphQL server (based on based on Apollo Server & Express)
- [Prisma](https://www.prisma.io/) for a GraphQL database ORM (running on MySQL)
- [GraphQL Playground](https://github.com/prisma/graphql-playground)
- [Nodemon](https://github.com/remy/nodemon) to automatically restart the server when code changes are made
- [Dotenv](https://github.com/motdotla/dotenv) to handle environment variables
- JWT Authentication built in
- Example models for Users and Posts

*Originally based on [node-graphql-server](https://github.com/graphql-boilerplates/node-graphql-server)*

## Requirements

- Node, NPM and *Yarn*
- Prisma CLI installed globally - `yarn global add prisma`
- Docker and Docker Compose (installed and running)

## Getting started

```sh
# --- Prisma Server --- #

# 1. Start up a local Prisma Server and DB via Docker (https://bit.ly/2JpRbQf)
docker-compose up -d

# 2. Copy `.env.example` to `.env` and add your new DB endpoint and update the keys
cp .env.example .env && nano .env

# 3. Deploy the data models to your local Prisma server
yarn prisma-deploy-dev

# --- GraphQL Server --- #

# 4. Install dependencies
yarn install

# 5. Start GraphQL server (runs playground on http://localhost:4000)
yarn start
```

---

## Commands

|| Command | Description |
| --- | --- | --- |
| **Prisma Server** |
|| `yarn prisma-start` | Starts the local Prisma server and database |
|| `yarn prisma-stop` | Stops the local Prisma server and database |
|| `yarn prisma-deploy-dev` | Deploys Prisma server to using `.env` |
|| `yarn prisma-deploy-prod` | Deploys Prisma server to using `.env.prod` |
| **GraphQL Server** |
|| `yarn graphql-start` | Starts the GraphQL-Yoga server |
|| `yarn graphql-start-debug` | Starts the GraphQL-Yoga server in debug mode |
|| `yarn graphql-deploy` | Deploys GraphQL server to Lambda |

---

## File Structure

```
/prisma/                # Prisma database service configuration
    /generated/         # Generated files from the `prisma generate` command
    /datamodel.prisma   # Defines the database structure (written in GraphQL SDL)
    /prisma.yml         # The root configuration file for your Prisma database service
    /seed.graphql       # The database seed
/src/                   # The source files for your GraphQL server
    /Helpers/           # Helper functions
    /Resolvers/         # All Resolvers for the application schema
        /Models/        # Updates to data model queries (eg. adding a property to a response)
        /Mutation/      # Custom mutations (eg. sign up, login...)
        /Query/         # Custom queries (eg. me)
        /Subscription/  # Define the data that can be subscribed to
    /index.js           # The entry point for your GraphQL server
    /schema.graphql     # The schema defining the API exposed to client applications
```

---

## Deploying to Production

```sh
# --- Prisma Server --- #

# 1. Setup a Production Prisma Server
#    - Digital Ocean - https://bit.ly/2JdM713
#    - AWS EC2 - https://bit.ly/2TEcces
#    - AWS Fargate - https://bit.ly/2FdFGqV
#    - Heroku - https://bit.ly/2THPbYk
#    - Now.sh - https://bit.ly/2Tzn51b

# 2. Add the respective Environment variables to .env.prod
cp .env.example .env.prod && nano .env.prod

# 3. Deploy the data models to the production Prisma server
yarn prisma-deploy-prod

# --- GraphQL Server --- #

# 4. Deploy the GraphQL Server to AWS Lambda
#    - Setup an AWS IAM user to get your keys - https://bit.ly/2TJDcsq
export AWS_ACCESS_KEY_ID=<secret>
export AWS_SECRET_ACCESS_KEY=<secret>
yarn graphql-deploy

# 5. Setup the environment variables in your Lambda
#    - Login to the AWS console > Lambda and browse to the function/s
#    - Add each of the variables from `.env` in the 'Environment variables' section of each function
```

---

## User / Authentication *queries/mutations*

### Sign Up

```
mutation {
  signup(
    email: "zeus@examples.com"
    password: "secret42"
    name: "Zeus"
  ) {
    token
    user {
      id
      name
      email
    }
  }
}
```

### Login

```
mutation {
  login(
    email: "zeus@examples.com"
    password: "secret42"
  ) {
    token
    user {
      email
    }
  }
}
```

### Update My Account
```
mutation {
  updateUser(
    email: "zeus@example.com"
    name: "Jane"
    password: "123Abc123Abc"
  ) {
    id
    name
    email
  }
}
```

### Me
*Requires `"Authorization": "Bearer ...""` header*

```
query {
  me {
    id
    name
    email
    posts {
      title
      published
    }
  }
}
```

---

## Post *queries/mutations*

### **Create** a (draft) Post
*Requires `"Authorization": "Bearer ...""` header*

```
mutation {
  createDraft(
    title: "New Draft Post"
    content: "Hello new post that's not posted yet"
  ) {
    id
    title
    content
    author {
      name
    }
  }
}
```

### **List** Posts - List of All Published Posts

```
query {
  listPosts {
    id
    title
    content
    author {
      name
    }
  }
}
```

### **List** Posts - List of My Drafted Posts
*Requires `"Authorization": "Bearer ...""` header*

```
query {
  listDraftPosts {
    id
    title
    content
    author {
      name
    }
  }
}
```

### **Read** a Post

```
query {
  post(id: "cjt74m7fy06at0b18gk07p7ks") {
    id
    title
    content
    author {
      name
    }
  }
}
```

### **Update** a Post (one of my draft Posts to be Published)
*Requires `"Authorization": "Bearer ...""` header*

```
mutation {
  publish(id: "cjt6q05lh2qi70b45gkux1gfv") {
    id
    title
    content
    published
    author {
      name
    }
  }
}
```

### **Delete** a Post (one that I own)
*Requires `"Authorization": "Bearer ...""` header*

```
mutation {
  deletePost(id: "cjt6q6des2shk0b45gtusvd9d") {
    id
    title
  }
}
```
