<div align="center">

# 🤝 Contributing to Coral Reef

### *Where Knowledge Unites*

**G H Raisoni University, Amravati**  
**Department of Computer Science and Engineering**  
**Academic Session 2026–27**

</div>

---

## 📖 About This Guide

Thank you for contributing to **Coral Reef — Where Knowledge Unites**.

This document explains the recommended GitHub workflow for team members who want to contribute code, UI improvements, bug fixes, documentation or other project changes.

The repository follows a **fork → branch → change → test → Pull Request → review** workflow.

---

# 🌿 Contribution Workflow

```text
Fork Repository
      ↓
Clone Your Fork
      ↓
Create Feature Branch
      ↓
Make Changes
      ↓
Test Locally
      ↓
Commit Changes
      ↓
Push Branch
      ↓
Create Pull Request
      ↓
Review
      ↓
Merge
```

---

# 1. 🍴 Fork the Repository

Open the Coral Reef repository on GitHub and click **Fork**.

Your fork will belong to your own GitHub account, while the original repository remains the main project repository.

---

# 2. 📥 Clone Your Fork

After creating your fork, copy its HTTPS URL and run:

```bash
git clone https://github.com/YOUR-USERNAME/Coral-Reef-Skill-Exchange.git
cd Coral-Reef-Skill-Exchange
```

Replace `YOUR-USERNAME` with your actual GitHub username.

---

# 3. 🌱 Create a Separate Branch

Do not make feature changes directly on `main`.

Create a branch for your work:

```bash
git checkout -b feature/your-feature
```

Examples:

```bash
git checkout -b feature/skill-verification
```

```bash
git checkout -b feature/learning-roadmap
```

```bash
git checkout -b feature/chat-improvements
```

For bug fixes:

```bash
git checkout -b fix/responsive-ui
```

For documentation:

```bash
git checkout -b docs/project-report
```

---

# 4. 💻 Make Your Changes

Work only on the feature, bug fix or documentation assigned to you.

Before changing an existing feature:

- Understand the existing implementation.
- Avoid unnecessary rewrites.
- Preserve working functionality.
- Keep the project structure consistent.
- Avoid unrelated changes.

---

# 5. 🧪 Test Your Changes

Always test your changes before committing.

For frontend changes, check:

- Desktop layout
- Mobile layout
- Navigation
- Buttons and links
- Forms
- Existing features affected by your changes

For backend changes, check:

- API response
- Authentication
- Validation
- Database behavior
- Existing API functionality

If your change affects both frontend and backend, test the complete user flow.

---

# 6. 📦 Check Your Changes

Before committing, check the files changed:

```bash
git status
```

Review the actual changes:

```bash
git diff
```

Make sure you have not accidentally included:

- Passwords
- API keys
- Tokens
- `.env` files
- `db.sqlite3`
- `venv/`
- Temporary files
- Unrelated project files

---

# 7. 💾 Commit Your Changes

Add the intended changes:

```bash
git add .
```

Create a meaningful commit:

```bash
git commit -m "feat: describe your change"
```

### Good commit examples

```text
feat: add skill verification API
```

```text
feat: improve roadmap progress tracking
```

```text
fix: resolve mobile navigation issue
```

```text
fix: validate connection requests
```

```text
docs: update project documentation
```

```text
style: improve profile page UI
```

Commit messages should describe **actual work performed**.

Do not create commits only to increase the visible contribution count.

---

# 8. 🚀 Push Your Branch

Push your branch to your fork:

```bash
git push origin feature/your-feature
```

For example:

```bash
git push origin feature/skill-verification
```

---

# 9. 🔀 Create a Pull Request

After pushing your branch:

1. Open your fork on GitHub.
2. GitHub should show an option to create a Pull Request.
3. Select the original Coral Reef repository as the destination.
4. Set the target branch to `main`.
5. Give the Pull Request a clear title.
6. Describe what you changed.
7. Add screenshots for UI changes.
8. Mention how you tested the change.
9. Submit the Pull Request.

---

# 📝 Pull Request Checklist

Before submitting a Pull Request:

- [ ] My changes are related to the stated purpose.
- [ ] I tested the changes locally.
- [ ] Existing functionality still works.
- [ ] Responsive behavior was checked when applicable.
- [ ] API functionality was checked when applicable.
- [ ] I did not commit passwords, tokens or API keys.
- [ ] I did not commit `.env` files containing secrets.
- [ ] I did not commit the local database.
- [ ] I did not commit the virtual environment.
- [ ] I included screenshots for significant UI changes.
- [ ] I wrote a clear Pull Request description.

---

# 🌱 Branch Naming

Use descriptive branch names.

### Features

```text
feature/skill-verification
feature/learning-roadmap
feature/chat-improvements
feature/frontend-ui
```

### Bug Fixes

```text
fix/responsive-ui
fix/backend-validation
fix/chat-message-error
```

### Documentation

```text
docs/project-report
docs/readme-update
docs/api-documentation
```

---

# 📝 Commit Message Convention

Use a simple prefix describing the type of change.

| Prefix | Use For |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `style:` | UI/style changes |
| `refactor:` | Code restructuring |
| `test:` | Tests |
| `chore:` | Maintenance/configuration |

Examples:

```text
feat: add skill verification API
```

```text
fix: resolve profile image loading
```

```text
docs: update contribution guide
```

```text
test: add connection request tests
```

---

# 🔄 Keeping Your Fork Updated

Before starting new work, it is recommended to make sure your local `main` branch is updated.

If your fork's `main` tracks the original project repository, pull the latest changes:

```bash
git checkout main
git pull origin main
```

Then create a new feature branch:

```bash
git checkout -b feature/your-feature
```

> If your fork is configured differently, use the appropriate remote configuration for your repository.

---

# 🧹 Keeping Changes Clean

A Pull Request should contain only changes relevant to the task.

### Avoid

- Large unrelated formatting changes.
- Deleting working features without discussion.
- Committing temporary files.
- Changing unrelated files.
- Replacing existing functionality unnecessarily.
- Hardcoding fake data where real application behavior is expected.

### Prefer

- Small focused changes.
- Clear naming.
- Existing project conventions.
- Reusable components.
- Proper validation.
- Testing before submission.

---

# 🔐 Security Rules

Never commit sensitive information.

Do **not** commit:

```text
.env
```

```text
db.sqlite3
```

```text
venv/
```

```text
*.log
```

Do not place passwords, API keys, authentication tokens or other secrets directly inside source code.

If a secret is accidentally committed, inform the project lead immediately.

---

# 🎨 UI/UX Contribution Guidelines

For frontend changes:

- Keep the existing Coral Reef visual identity.
- Maintain responsive behavior.
- Check desktop and mobile layouts.
- Make buttons and links meaningful.
- Avoid introducing unnecessary single-page scrolling.
- Keep navigation consistent.
- Reuse shared components where appropriate.
- Include screenshots in the Pull Request when the UI changes significantly.

---

# 🐍 Backend Contribution Guidelines

For Django/REST API changes:

- Follow the existing Django app structure.
- Use serializers for API data.
- Protect authenticated endpoints appropriately.
- Validate user input.
- Do not expose unnecessary user information.
- Create migrations when models change.
- Test affected API workflows.
- Preserve existing authentication and permissions.

---

# 📱 Responsive Testing

When making UI changes, test at least:

- Desktop
- Tablet-sized viewport
- Mobile-sized viewport

Check:

- Navbar
- Menus
- Buttons
- Forms
- Cards
- Modals
- Tables
- Text wrapping
- Horizontal overflow

---

# 👥 Team Contributions

Coral Reef is an academic team project.

Contributions may include:

- Software development
- Research
- Testing
- Documentation
- UI/UX feedback
- Presentation preparation

The `CONTRIBUTORS.md` file records the project's team information and contribution responsibilities.

Technical GitHub history should represent **actual technical work performed through GitHub**.

---

# 🆘 Need Help?

Before opening a Pull Request:

1. Check the existing project documentation.
2. Check whether the issue has already been discussed.
3. Reproduce the problem clearly.
4. Describe what you changed.
5. Explain what you tested.

For project-specific coordination, contact the project lead.

---

<div align="center">

### 🌊 Coral Reef — Where Knowledge Unites

**Learn • Share • Connect • Grow**

</div>
