# LifeHub: The Ultimate Personal Life Manager

LifeHub is a comprehensive personal life management web platform that centralizes tasks, finances, habits, and more in a single customizable dashboard. This all-in-one solution helps you organize your daily life and boost productivity.

![LifeHub Dashboard](./screenshots/dashboard.png)

## Features

- **Customizable Dashboard**: Drag-and-drop widgets to organize your view
- **Task Management**: Track to-dos and set goals with priorities and due dates
- **Calendar**: Schedule and manage events with color-coding and reminders
- **Budget Tracker**: Monitor income, expenses, and financial goals
- **Habit Tracker**: Build and maintain habits with streak tracking
- **Journal**: Record thoughts, experiences, and daily reflections
- **Contact Manager**: Organize your personal and professional contacts
- **Document Storage**: Store and organize important files
- **Community Tips**: Share and discover productivity insights
- **Quick Tools**: Access calculators, timers, random generators, and more

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **State Management**: React Query, React Context
- **UI Components**: Radix UI, Lucide React icons
- **Storage**: In-memory database (can be extended to PostgreSQL)

## Installation

### Prerequisites

- Node.js (v16+)
- npm (v7+)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/lifehub.git
cd lifehub
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to:

```
http://localhost:5000
```

## Usage

### Dashboard

The dashboard is the central hub of the application. Here you can:

- Add widgets by clicking the "+" button
- Drag and drop widgets to reorganize them
- Configure widget settings using the dropdown menu in each widget

### Tasks

Manage your to-do list and track goals:

- Create tasks with titles, descriptions, due dates, and priorities
- Mark tasks as complete
- Filter tasks by category or status
- Track your productivity over time

### Calendar

Organize your schedule:

- Add events with title, location, start/end times
- Color-code events by category
- View events in month, week, or day view

### Budget

Track your finances:

- Record income and expenses
- Categorize transactions
- View spending patterns and trends
- Set budget goals and limits

### Habits

Build better routines:

- Create habits with frequency settings
- Track daily completions
- View streaks and progress
- Get insights on habit formation

### Journal

Record your thoughts:

- Write daily entries with rich text formatting
- Add mood tracking to entries
- Search past entries
- Track emotional patterns over time

### Documents

Organize important files:

- Upload and store documents
- Organize with tags and categories
- Quick access to recent files
- Search functionality

### Community

Connect and share:

- Post and read productivity tips
- Upvote helpful content
- Filter by category
- Build a supportive community

## Configuration

LifeHub uses a theme.json file for customization. You can adjust:

- Primary color scheme
- Light/dark mode defaults
- UI radius settings
- Component styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Shadcn UI for the component library
- Lucide React for the beautiful icons
- TailwindCSS for styling
- React Query for data fetching