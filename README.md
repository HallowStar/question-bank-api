# Question Bank REST API

Question Bank is an API that provides questions for students created by teachers. It allows users to search for questions based on specific requirements such as difficulty, subject, topic, and tags. Teachers can add and edit questions as well as provide feedback on student answers, while students can answer questions that include answer keys. The platform supports both multiple-choice and open-ended question types.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Native Driver)
- **Security:** JSON Web Tokens (JWT), Bcrypt (Password Hashing)

---

## Project Structure

```text
app/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── questionController.js
│   ├── subjectController.js
│   └── topicController.js
├── middleware/
│   ├── authentication.js
│   └── validation.js
├── routes/
│   ├── authRoutes.js
│   ├── questionRoutes.js
│   ├── subjectRoutes.js
│   └── topicRoutes.js
├── utils/
│   └── validation.js
└── index.js
```

---

## Setup & Installation

### Install Dependencies

```bash
npm install express mongodb dotenv cors jsonwebtoken bcrypt
```

---

### Create Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
TOKEN_SECRET=your_jwt_secret_key
```

---

### Run the Server

```bash
node app/index.js
```

---

### Roles

#### Teacher

- Full CRUD access to:

  - Subjects
  - Topics
  - Questions

- Can add feedback to student answers

#### Student

- Read access to questions
- Can:

  - Submit answers
  - Edit answers
  - Delete their own answers

---

## API DOCUMENTATION

### Authentication Endpoints

### Register User

#### Title

Register User

#### Method

POST

#### Endpoint Path

`/user/register`

#### Access

Public

#### Body

```json id="b14esv"
{
  "name": "John Doe",
  "contact": "1234567890",
  "email": "johndoe@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123",
  "birthDate": "2000-12-31",
  "address": "123 Main St",
  "role": "teacher"
}
```

#### Parameters

- `name` (string): The full name of the user
- `contact` (string/number): The contact number of the user
- `email` (string): The email address of the user
- `password` (string): The password for the account
- `confirmPassword` (string): Must match the password
- `birthDate` (string): The birth date in YYYY-MM-DD format
- `address` (string): The physical address of the user
- `role` (string): The role of the user (`teacher` or `student`)

#### Expected Response

```json id="sgihla"
{
  "message": "Account Created Successfully",
  "result": {
    "acknowledged": true,
    "insertedId": "64b1f..."
  }
}
```

---

### Login User

#### Title

Login User

#### Method

POST

#### Endpoint Path

`/user/login`

#### Access

Public

#### Body

```json id="n8bf8m"
{
  "email": "johndoe@example.com",
  "password": "securepassword123"
}
```

#### Parameters

- `email` (string): Registered email address
- `password` (string): Account password

#### Expected Response

```json id="wwy4gs"
{
  "message": "Login Successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Subject Endpoints

### Retrieve All Subjects

#### Title

Retrieve all subjects

#### Method

GET

#### Endpoint Path

`/api/subject`

#### Access

Teacher Only

#### Body

N/A

#### Parameters

N/A

#### Expected Response

```json id="e8f9u4"
{
  "message": "Subject Found Successfully",
  "subjects": [
    {
      "_id": "64b1f...",
      "name": "Mathematics",
      "department": "Science",
      "description": "Calculus and Algebra",
      "code": "MATH101"
    }
  ]
}
```

---

### Get Details of a Single Subject

#### Title

Get details of a single subject

#### Method

GET

#### Endpoint Path

`/api/subject/<id>`

#### Access

Teacher Only

#### Body

N/A

#### Parameters

- `id` (string): Unique ObjectId of the subject

#### Expected Response

```json id="vc1wpm"
{
  "message": "Subject found",
  "result": {
    "_id": "64b1f...",
    "name": "Mathematics",
    "department": "Science",
    "description": "Calculus and Algebra",
    "code": "MATH101"
  }
}
```

---

### Create a New Subject

#### Title

Create a new subject

#### Method

POST

#### Endpoint Path

`/api/subject`

#### Access

Teacher Only

#### Body

```json id="g0g8ei"
{
  "name": "Mathematics",
  "department": "Science",
  "description": "Calculus and Algebra",
  "code": "MATH101"
}
```

#### Parameters

- `name` (string): Subject name
- `department` (string): Department name
- `description` (string): Subject description
- `code` (string): Unique subject code

#### Expected Response

```json id="7i6uzn"
{
  "message": "Subject added successfully",
  "result": {
    "acknowledged": true,
    "insertedId": "64b1f..."
  }
}
```

---

### Edit an Existing Subject

#### Title

Edit an existing subject

#### Method

PUT

#### Endpoint Path

`/api/subject/<id>`

#### Access

Teacher Only

#### Body

```json id="gzzd3u"
{
  "name": "Advanced Mathematics",
  "department": "Science",
  "description": "Advanced Calculus",
  "code": "MATH201"
}
```

#### Parameters

- `id` (string): Unique ObjectId of the subject
- `name` (string): Updated subject name
- `department` (string): Updated department
- `description` (string): Updated description
- `code` (string): Updated subject code

#### Expected Response

```json id="tbm87p"
{
  "message": "Subject updated successfully",
  "result": {
    "acknowledged": true,
    "matchedCount": 1,
    "modifiedCount": 1
  }
}
```

---

### Delete a Subject

#### Title

Delete a subject

#### Method

DELETE

#### Endpoint Path

`/api/subject/<id>`

#### Access

Teacher Only

#### Body

N/A

#### Parameters

- `id` (string): Unique ObjectId of the subject

#### Expected Response

```json id="h0fntx"
{
  "message": "Subject and related data deleted successfully"
}
```

---

## Topic Endpoints

### Retrieve All Topics

#### Title

Retrieve all topics

#### Method

GET

#### Endpoint Path

`/api/topic`

#### Access

Teacher Only

#### Body

N/A

#### Parameters

N/A

#### Expected Response

```json id="46m0r8"
{
  "message": "Topics Found Successfully",
  "topics": [
    {
      "_id": "64b1f...",
      "name": "Derivatives",
      "description": "Introduction to derivatives",
      "code": "DERIV01"
    }
  ]
}
```

---

### Create a New Topic

#### Title

Create a new topic

#### Method

POST

#### Endpoint Path

`/api/topic`

#### Access

Teacher Only

#### Body

```json id="vq9e3r"
{
  "name": "Derivatives",
  "subjectCode": "MATH101",
  "description": "Introduction to derivatives",
  "code": "DERIV01"
}
```

#### Parameters

- `name` (string): Topic name
- `subjectCode` (string): Related subject code
- `description` (string): Topic description
- `code` (string): Unique topic code

#### Expected Response

```json id="q01hhg"
{
  "message": "Topic added successfully",
  "result": {
    "acknowledged": true,
    "insertedId": "64b1f..."
  }
}
```

---

### Edit an Existing Topic

#### Title

Edit an existing topic

#### Method

PUT

#### Endpoint Path

`/api/topic/<id>`

#### Access

Teacher Only

#### Body

```json id="gzzd3u"
{
  "name": "Derivatives Updated",
  "subjectCode": "MATH101",
  "description": "Introduction to derivatives",
  "code": "DERIV01"
}
```

#### Parameters

- `id` (string): Unique ObjectId of the topic
- `name` (string): Updated subject name
- `subjectCode` (string): Updated subject of the topic
- `description` (string): Updated description
- `code` (string): Updated topic code

#### Expected Response

```json id="tbm87p"
{
  "message": "Topic updated successfully",
  "result": {
    "acknowledged": true,
    "matchedCount": 1,
    "modifiedCount": 1
  }
}
```

---

### Delete a Subject

#### Title

Delete a Topic

#### Method

DELETE

#### Endpoint Path

`/api/subject/<id>`

#### Access

Teacher Only

#### Body

N/A

#### Parameters

- `id` (string): Unique ObjectId of the subject

#### Expected Response

```json id="h0fntx"
{
  "message": "Topic and related data deleted successfully"
}
```

---

## Question Endpoints

### Retrieve All Questions

#### Title

Retrieve all questions

#### Method

GET

#### Endpoint Path

`/api/question`

#### Access

Public

#### Body

N/A

#### Parameters

N/A

#### Expected Response

```json id="fyjlwm"
{
  "questions": [
    {
      "_id": "64b1f...",
      "text": "What is 1+1?",
      "type": "multiple-choice",
      "difficulty": "easy",
      "options": ["1", "2", "3", "4"],
      "correctAnswer": "2"
    }
  ]
}
```

---

### Search Question by ID

#### Title

Retrieve all questions

#### Method

GET

#### Endpoint Path

`/api/question/:id`

#### Access

Public

#### Body

N/A

#### Parameters

- `id` (string) : Unique ObjectID of the question

#### Expected Response

```json id="fyjlwm"
{
  "message": "Question found",
  "result": {
    "_id": "6a16b1f476c789ffa4293dc5",
    "text": "What is 3x + 4 = 13 ?",
    "type": "multiple-choice",
    "difficulty": "easy"
  }
}
```

---

### Search Questions

#### Title

Search questions by query parameters

#### Method

GET

#### Endpoint Path

`/api/question/search?<query_parameters>`

#### Access

Public

#### Body

N/A

#### Parameters

- `name` (string): Regex search for question text
- `difficulty` (string): Comma-separated difficulty list
- `topic` (string): Topic code
- `subject` (string): Subject code
- `tags` (string): Comma-separated tags

#### Expected Response

```json id="vlm20o"
{
  "message": "Question found",
  "result": [
    {
      "_id": "64b1f...",
      "text": "What is 1+1?",
      "difficulty": "easy"
    }
  ]
}
```

---

### Create a New Question

#### Title

Create a new question

#### Method

POST

#### Endpoint Path

`/api/question`

#### Access

Teacher Only

#### Body

```json id="j7x28z"
{
  "text": "What is the derivative of x?",
  "type": "multiple-choice",
  "options": ["0", "1", "x", "2x"],
  "correctAnswer": "1",
  "difficulty": "medium",
  "tags": ["calculus"],
  "topicCode": "DERIV01",
  "subjectCode": "MATH101"
}
```

#### Parameters

- `text` (string): Question text
- `type` (string): Question type
- `options` (array): Multiple-choice options
- `correctAnswer` (string): Correct answer
- `difficulty` (string): Difficulty level
- `tags` (array): Related tags
- `topicCode` (string): Topic code
- `subjectCode` (string): Subject code

#### Expected Response

```json id="fsdd8m"
{
  "message": "Question added successfully",
  "result": {
    "acknowledged": true,
    "insertedId": "64b1f..."
  }
}
```

---

### Edit a New Question

#### Title

Create a new question

#### Method

PUT

#### Endpoint Path

`/api/question/:id`

#### Access

Teacher Only

#### Body

```json id="j7x28z"
{
  "text": "What is the derivative of x Updated?",
  "type": "multiple-choice",
  "options": ["0", "1", "x", "2x"],
  "correctAnswer": "1",
  "difficulty": "medium",
  "tags": ["calculus"],
  "topicCode": "DERIV01",
  "subjectCode": "MATH101"
}
```

#### Parameters

- `id` (string) : Unique ObjectID of the question
- `text` (string): Updated question text
- `type` (string): Updated question type
- `options` (array): Updated multiple-choice options
- `correctAnswer` (string): Updated correct answer
- `difficulty` (string): Updated difficulty level
- `tags` (array): Updated related tags
- `topicCode` (string): Updated topic code
- `subjectCode` (string): Updated subject code

#### Expected Response

```json id="fsdd8m"
{
  "message": "Question edited successfully",
  "result": {
    "acknowledged": true,
    "modifiedCount": 1,
    "upsertedId": null,
    "upsertedCount": 0,
    "matchedCount": 1
  }
}
```

---

### Delete a Question

#### Title

Create a new question

#### Method

DELETE

#### Endpoint Path

`/api/question/:id`

#### Access

Teacher Only

#### Body

N/A

#### Parameters

- `id` (string) : Unique ObjectId of the question

#### Expected Response

```json id="fsdd8m"
{
  "message": "Question edited successfully",
  "result": {
    "acknowledged": true,
    "modifiedCount": 1,
    "upsertedId": null,
    "upsertedCount": 0,
    "matchedCount": 1
  }
}
```

---

## Answer Endpoints

### Submit an Answer

#### Title

Submit an answer to a question

#### Method

POST

#### Endpoint Path

`/api/question/<id>/answer`

#### Access

Student Only

#### Body

```json id="m1a1ry"
{
  "answer": "The answer is 2x because of the power rule."
}
```

#### Parameters

- `id` (string): Question ObjectId
- `answer` (string): Student answer

#### Expected Response

```json id="qpd82y"
{
  "message": "Answer added successfully"
}
```

---

### Edit an Answer or Add Feedback

#### Title

Edit an answer (student) or add feedback (teacher)

#### Method

PUT

#### Endpoint Path

`/api/question/<id>/answer/<answerId>`

#### Access

Student or Teacher

#### Body

```json id="c68z9r"
{
  "answer": "My updated answer...",
  "feedback": "Good job, but check your math!"
}
```

#### Parameters

- `id` (string): Question ObjectId
- `answerId` (string): Answer ObjectId
- `answer` (string): Updated answer
- `feedback` (string): Teacher feedback

#### Expected Response

```json id="h92mhh"
{
  "message": "Answer edited successfully"
}
```

---

### Delete an Answer or Remove Feedback

#### Title

Delete an answer or remove feedback

### Method

DELETE

#### Endpoint Path

`/api/question/<id>/answer/<answerId>`

#### Access

Student or Teacher (Their Own)

#### Body

N/A

#### Parameters

- `id` (string): Question ObjectId
- `answerId` (string): Answer ObjectId

#### Expected Response

```json id="if45gj"
{
  "message": "Answer Bank updated successfully"
}
```
