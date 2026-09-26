# 🌊 Coral Reef

## Where Knowledge Unites

> **A skill-exchange platform that connects people through what they know and what they want to learn.**

---

<div align="center">

### 🎓 4th Year B.Tech. Major Project

**Bachelor of Technology — Computer Science and Engineering**  
**Academic Session 2026–27**

**G H Raisoni University, Amravati**  
**Department of Computer Science and Engineering**

### Guided By

**Prof. Mr. Amol Dhankar**

</div>

---

# 📌 1. Project Information

| Category | Details |
|---|---|
| **Project Title** | Coral Reef |
| **Tagline** | Where Knowledge Unites |
| **Project Type** | Major Project |
| **Academic Program** | B.Tech. — Computer Science and Engineering |
| **Year** | 4th Year |
| **Academic Session** | 2026–27 |
| **University** | G H Raisoni University, Amravati |
| **Department** | Department of Computer Science and Engineering |
| **Project Guide** | Prof. Mr. Amol Dhankar |

---

# 👥 2. Project Team

| No. | Name | Roll No. | Role |
|:---:|---|---|---|
| 01 | **Nikhil Singh** | H-CSE-06 | Project Lead & Primary Developer |
| 02 | **Jeeya Vaswani** | F-71 | Team Member — Research, Documentation & Presentation |
| 03 | **Rizviya Shaikh** | F-66 | Team Member — Research, Testing & Documentation |
| 04 | **Tharvesh Khorgade** | F-55 | Team Member — Testing, UI/UX Feedback & Presentation |
| 05 | **Manthan Rakas** | F-2 | Team Member — Documentation, Testing & Presentation |
| 06 | **Yash Bawankar** | F-70 | Team Member — Research, Testing & Presentation |

> **GitHub usernames of team members will be added to the contributor record as they create their GitHub accounts.**

---

# 🎯 3. Project Vision

**Coral Reef** is a skill-exchange platform designed around peer-to-peer learning.

The platform aims to connect people who want to learn particular skills with people who can teach those skills. Instead of treating learning as a one-way process, Coral Reef encourages users to both **share knowledge and learn from others**.

The platform brings skill discovery, user profiles, skill matching, compatibility scoring, connection requests, communication, skill verification and learning roadmaps into one integrated environment.

---

# 💡 4. Core Idea

The central idea of Coral Reef is simple:

> **Everyone knows something that someone else wants to learn.**

Users can:

- Add skills they can teach.
- Add skills they want to learn.
- Discover suitable learning partners.
- Compare complementary skills.
- View compatibility scores.
- Send connection requests.
- Communicate with accepted connections.
- Verify their skills.
- Follow a structured learning roadmap.

This creates a collaborative environment where users can **connect, communicate, verify and grow together**.

---

# 🌟 5. What Coral Reef Provides

## 🔎 Discover

Users can explore available skills and identify areas they want to learn.

## 🎯 Match

The platform compares teaching and learning skills to identify compatible learning partners.

## 🤝 Connect

Users can send connection requests to suitable learning partners and manage incoming requests.

## 💬 Communicate

Accepted connections can communicate through a private one-to-one chat system.

## 🏆 Verify

Users can participate in skill verification activities and coding challenges to demonstrate their knowledge.

## 🗺️ Grow

Users can follow a personalized learning roadmap based on their learning goals.

---

# ⭐ 6. Core Project Features

| Feature | Description |
|---|---|
| 🎯 **Skill Compatibility Score** | Calculates compatibility between users based on complementary teaching and learning skills. |
| 💬 **One-to-One Chat** | Enables private communication between accepted learning partners. |
| 🏆 **Skill Verification** | Provides a structured process for assessing and verifying user skills. |
| 🗺️ **Learning Roadmap** | Provides a structured learning path based on the user's learning goal. |

---

# 🔧 7. Supporting Features

### 👤 User Management

- User registration
- User login
- Authentication
- Session management
- Profile management

### 📚 Skill Management

- Teaching skill selection
- Learning skill selection
- Add and remove skills
- Skill-based profile information

### 🔎 Skill Discovery

- Skill search
- Skill categories
- Skill exploration
- Popular skill discovery

### 🤝 Matching

- Skill-based partner matching
- Complementary skill comparison
- Compatibility score
- Match profile information

### 📩 Connection Management

- Send connection requests
- View incoming requests
- Accept requests
- Reject requests
- Connection status handling

### 💬 Communication

- One-to-one conversations
- Persistent messages
- Conversation list
- Message history
- Connected-user communication

### 🏆 Verification

- Skill selection
- Skill assessment
- Question-based verification
- Result generation
- Coding challenge support

### 🗺️ Learning

- Learning goals
- Learning roadmap
- Roadmap steps
- Learning progress

### 📊 Dashboard

- User information
- Skill information
- Learning partners
- Match information
- Connection notifications
- Quick actions

---

# 🏗️ 8. System Architecture

The Coral Reef platform follows a frontend–backend architecture in which the user interface communicates with the Django REST backend through APIs.

```text
                         ┌─────────────────────────┐
                         │          USER           │
                         │     Web / Mobile UI     │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       FRONTEND          │
                         │   HTML • CSS • JS       │
                         └────────────┬────────────┘
                                      │
                                 REST API
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │        BACKEND          │
                         │ Python • Django         │
                         │ Django REST Framework   │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │        DATABASE         │
                         │ Users • Skills          │
                         │ Connections • Chat      │
                         │ Messages • Progress     │
                         └─────────────────────────┘
```

---

# 🔄 9. Application Workflow

```text
START
  ↓
Register / Login
  ↓
Create Profile
  ↓
Add Teaching & Learning Skills
  ↓
Find Matches
  ↓
View Compatibility Score
  ↓
Send Connection Request
  ↓
Connection Accepted
  ↓
Start Chat
  ↓
Verify Skills / Practice
  ↓
Follow Learning Roadmap
  ↓
Learn & Grow
```

---

# 👤 10. Current User Journey

```text
01  DISCOVER
        ↓
02  REGISTER
        ↓
03  CREATE PROFILE
        ↓
04  ADD TEACHING & LEARNING SKILLS
        ↓
05  FIND COMPATIBLE USERS
        ↓
06  VIEW COMPATIBILITY SCORE
        ↓
07  SEND CONNECTION REQUEST
        ↓
08  ACCEPT CONNECTION
        ↓
09  START CHAT
        ↓
10  VERIFY SKILLS
        ↓
11  FOLLOW LEARNING ROADMAP
        ↓
12  GROW TOGETHER
```

---

# 🎓 11. Project Objectives

1. To create a platform where users can teach the skills they know and learn new skills from others.

2. To connect people with complementary skills using a skill-matching system.

3. To provide secure user registration, login and profile management.

4. To enable skill exchange requests so users can send, accept or reject collaboration requests.

5. To facilitate communication through an integrated chat feature.

6. To maintain centralized information for users, skills, connections and messages.

7. To encourage collaborative learning by creating a community where knowledge can be shared.

8. To make learning more accessible through peer-to-peer knowledge exchange.

---

# 🛠️ 12. Technology Stack

## Frontend

- **HTML5**
- **CSS3**
- **JavaScript**

## Backend

- **Python**
- **Django**
- **Django REST Framework**

## Database

- **SQLite** — current development database

## Development & Version Control

- Visual Studio Code
- Git
- GitHub
- GitHub CLI
- Python
- Django

---

# 📁 13. Project Organization

```text
Coral-Reef-Major-Project/
│
├── 01_Documentation/
├── 02_Research_Papers/
├── 03_PPT/
├── 04_Project_Report/
├── 05_UI_Design/
├── 06_Frontend/
├── 07_Backend/
├── 08_Database/
├── 09_Testing/
├── 10_Screenshots/
├── 11_Meeting_Notes/
├── 12_Poster/
├── 13_Final_Submission/
├── 14_Demo_Video/
│
├── CONTRIBUTORS.md
├── CONTRIBUTING.md
├── README.md
└── .gitignore
```

---

# 🧩 14. Major System Modules

## 14.1 Authentication Module

Provides user registration, login, authentication tokens, session handling, logout and protected user functionality.

## 14.2 User Profile Module

Provides user information, role, bio, teaching skills, learning skills and connected professional/coding profiles.

## 14.3 Skill Matching Module

Compares the skills users want to learn with skills other users can teach, and vice versa, to calculate compatibility and identify suitable learning partners.

## 14.4 Connection Module

Allows users to send requests, view request status, accept or reject incoming requests, and communicate after an accepted connection.

## 14.5 Chat Module

Provides one-to-one conversations, conversation creation, conversation listing, message sending and persistent message history.

## 14.6 Skill Verification Module

Provides skill selection, assessment, progress, results and coding challenge support.

## 14.7 Learning Roadmap Module

Helps users define learning goals, generate structured learning paths, follow roadmap steps and track learning progress.

---

# 📊 15. Development Status

| Module | Current Status |
|---|:---:|
| Project UI | ✅ |
| Responsive Design | ✅ |
| User Registration | ✅ |
| User Login | ✅ |
| Authentication | ✅ |
| User Profile | ✅ |
| Teaching Skills | ✅ |
| Learning Skills | ✅ |
| Skill Exploration | ✅ |
| Skill Matching | ✅ |
| Compatibility Score | ✅ |
| Connection Requests | ✅ |
| Dashboard | ✅ |
| One-to-One Chat | ✅ |
| Persistent Messages | ✅ |
| Learning Roadmap | 🔄 |
| Skill Verification | 🔄 |
| Verification Persistence | 🔄 |
| Complete End-to-End Testing | 🔄 |
| Final Documentation | 🔄 |
| Final Submission Preparation | 🔄 |

> **Note:** A module is marked complete only after its required functionality is properly implemented and integrated.

---

# 🧪 16. Testing & Quality

Testing covers:

- Authentication workflows
- Profile management
- Skill selection
- Skill matching
- Compatibility calculation
- Connection requests
- Chat conversations
- Message persistence
- Navigation
- Responsive layouts
- API communication
- Form validation
- Error handling

Detailed test cases are maintained in:

```text
09_Testing/
```

---

# 🔐 17. Security & Data Handling

The project follows basic application security practices including:

- Token-based authentication
- Protected API endpoints
- Authenticated user actions
- Input validation
- Server-side permission checks
- No committed passwords or API tokens
- Local database excluded from Git
- Virtual environments excluded from Git
- Environment secrets excluded from Git

---

# 🌐 18. GitHub & Version Control

### Repository

**Coral-Reef-Skill-Exchange**

### Repository Owner

**Nikhilrsingh**

### Main Branch

```text
main
```

The `main` branch represents the integrated project.

Future development can use branches such as:

```text
feature/skill-verification
feature/learning-roadmap
feature/chat-improvements
feature/frontend-ui
fix/responsive-ui
fix/backend-validation
docs/project-report
```

---

# 👥 19. Team Contribution

### Nikhil Singh — H-CSE-06

**Project Lead & Primary Developer**

Primary responsibilities include:

- Project architecture
- Frontend development
- Backend development
- API integration
- Database integration
- Authentication
- Skill matching
- Connection workflow
- Chat implementation
- Overall system integration

Other team members are credited for their assigned project-support responsibilities including:

- Research
- Documentation
- Testing
- UI/UX feedback
- Presentation preparation
- Project discussions

GitHub usernames will be added when the respective team members create their GitHub accounts.

> **Git commits and Pull Requests represent actual GitHub activity and should not be artificially created for contribution credit.**

---

# 📚 20. Project Documentation

| Folder | Purpose |
|---|---|
| `01_Documentation` | Requirements, planning, SRS and project information |
| `02_Research_Papers` | Research papers and literature material |
| `03_PPT` | Presentation files |
| `04_Project_Report` | Major project report |
| `05_UI_Design` | UI/UX design resources |
| `06_Frontend` | Frontend source code |
| `07_Backend` | Django backend source code |
| `08_Database` | Database design and related resources |
| `09_Testing` | Test cases and testing documentation |
| `10_Screenshots` | Project screenshots |
| `11_Meeting_Notes` | Project meeting records |
| `12_Poster` | Project poster |
| `13_Final_Submission` | Final submission materials |
| `14_Demo_Video` | Project demonstration video |

---

# 🚀 21. Future Development

Planned development includes:

- Complete backend integration for remaining modules
- Persistent skill verification results
- Verification status management
- Persistent learning roadmap progress
- Additional validation and error handling
- Complete end-to-end testing
- Improved user experience
- Final documentation
- Final project report
- Final presentation
- Poster and demonstration preparation

---

# 🎓 22. Academic Information

<div align="center">

## G H Raisoni University, Amravati

### Department of Computer Science and Engineering

**B.Tech. — Computer Science and Engineering**

**4th Year Major Project**

**Academic Session 2026–27**

### Project

# 🌊 Coral Reef

### Where Knowledge Unites

### Guided By

**Prof. Mr. Amol Dhankar**

### Project Team

**Jeeya Vaswani — F-71**  
**Rizviya Shaikh — F-66**  
**Nikhil Singh — H-CSE-06**  
**Tharvesh Khorgade — F-55**  
**Manthan Rakas — F-2**  
**Yash Bawankar — F-70**

</div>

---

# 📌 23. Project Repository Information

| Item | Information |
|---|---|
| **Project** | Coral Reef |
| **Repository** | Coral-Reef-Skill-Exchange |
| **Repository Owner** | Nikhilrsingh |
| **Project Type** | 4th Year B.Tech. Major Project |
| **Academic Session** | 2026–27 |
| **University** | G H Raisoni University, Amravati |
| **Department** | Computer Science and Engineering |
| **Guide** | Prof. Mr. Amol Dhankar |

---

<div align="center">

# 🌊 CORAL REEF

### WHERE KNOWLEDGE UNITES

**G H Raisoni University, Amravati**  
**Department of Computer Science and Engineering**

**B.Tech. Computer Science and Engineering • 4th Year • 2026–27**

**Guided by Prof. Mr. Amol Dhankar**

</div>
