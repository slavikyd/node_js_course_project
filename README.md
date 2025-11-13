## Vyacheslav Demyanenko K0709-22
### Educational project for Node.js course 

### Stack
Express.js, WebRTC, MongoDB, SocketIO

### Description

Educational project for backend JS course and research purposes of JS Web-video-streaming capabilites, with further comparison to Python and C++ web streaming.

## API Documentation

Interactive API docs are available at [http://localhost:PORT/api-docs](http://localhost:PORT/api-docs) (replace PORT with your running server port).

You can also view the OpenAPI specification file: `openapi.yaml`.


### OpenApi description
```
openapi: 3.1.1
info:
  title: VideoStreaming API
  version: 0.0.1
  description: An API for creating and managing real-time video streams.

paths:
  /rooms:
    post:
      summary: Create a new video room
      requestBody:
        required: false
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RoomCreateRequest'
      responses:
        '201':
          description: Room created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Room'
        '400':
          description: Invalid input

components:
  schemas:
    RoomCreateRequest:
      type: object
      properties:
        roomName:
          type: string
          example: "Team Standup"
        maxParticipants:
          type: integer
          example: 10
        isLocked:
          type: boolean
          default: false
    Room:
      type: object
      properties:
        id:
          type: uuid
        roomName:
          type: string
        createdAt:
          type: string
          format: date-time
        maxParticipants:
          type: integer
    User:
        type: object
        properties:
            id:
                type: uuid
            name:
                type: string
                example: "Test Testov"
            registered:
                type: string
                format: date
                example: "2025-09-10"
```