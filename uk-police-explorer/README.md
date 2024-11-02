# UK Police Data Explorer

## Overview

Welcome to the UK Police Data Explorer! This is a Rich Web Application created as part of JHUB Module 1B - "Creating a Rich Web Application." The application allows users to interact with the UK Police API to explore police force data, local neighbourhoods, crime statistics, and more for England, Wales, and Northern Ireland. The data is presented in an easy-to-use and visually engaging manner, with interactive maps and charts.

## Features

- Browse all police forces in England, Wales, and Northern Ireland.
- Explore local neighbourhoods within a selected police force.
- View detailed neighbourhood information, including team members, boundaries, and priorities.
- Access upcoming community events in selected neighbourhoods.
- View detailed crime statistics for selected areas.
- Dark/Light mode for comfortable viewing.
- Responsive design for seamless use across different devices.
- Real-time data updates from the UK Police API.

## What is Looks Like

![image](https://github.com/user-attachments/assets/d0f7a8d8-0c2a-4751-bd37-fdd6afb10eab)
![image](https://github.com/user-attachments/assets/d085ba86-b1ed-4a9f-87a7-a0aaaba1c2e4)
![image](https://github.com/user-attachments/assets/117f32ab-8a57-4eac-9c76-a4af2bb4ce6c)
![image](https://github.com/user-attachments/assets/2d3e0726-6730-41fa-87bb-6fb13dd8c423)



## Prerequisites

Before you get started, ensure you have the following installed:

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- Git (to clone the repository)

## Installation and Setup

### 1. Clone the Repository
Clone this repository to your local machine using the following command:
>git clone https://github.com/your-username/JHUB-Rich-Web-App.git
Navigate to the project directory:
>cd JHUB-Rich-Web-App

2. Install Dependencies
Install the required dependencies using npm:
>npm install

3. Start the Development Server
Run the following command to start the development server:
>npm run dev

The application should now be running at http://localhost:3000.

Usage

Select a Police Force: Start by selecting a police force from the dropdown list. The application will then display all neighbourhoods available for that force.

Explore Neighbourhoods: Once a neighbourhood is selected, detailed information is displayed, including the neighbourhood policing team, upcoming community events, crime statistics, and boundary maps.

View Crime Statistics: Use the interactive map and bar charts to visualize crime data for the selected area.

Technologies Used

React: A JavaScript library for building user interfaces.

Tailwind CSS: A utility-first CSS framework for styling.

Recharts: A library for creating data visualizations.

React Leaflet: For displaying interactive maps using Leaflet.

Vite: A fast build tool for modern web development.

UK Police API: Provides the real-time data for the application.

Project Structure

public/: Contains static assets like images and SVG files.

vite.svg: Vite logo.

src/: Contains the main application code.

assets/: Static assets like images.

react.svg: React logo.

components/: Reusable components like ThemeToggle and CrimeMap.

App.jsx: The main application component.

App.css: CSS specific to the App component.

index.css: Global CSS styles.

main.jsx: Entry point for rendering the React application.

test.js: Contains tests for the application.

.gitignore: Specifies files and directories to be ignored by Git.

index.html: The main HTML file.

package.json: Lists project dependencies and scripts.

postcss.config.js: Configuration for PostCSS.

tailwind.config.js: Configuration for Tailwind CSS.

vite.config.js: Configuration for Vite.

## Known Issues and Future Improvements

- **CORS Issues**: The UK Police API may block some requests due to CORS restrictions
- **Accessibility**: Planning to enhance features for visually impaired users
- **Additional Features**: Will add more datasets like stop and search data

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature-branch`)
5. Open a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For questions or support, please contact:
- Alex Orr - [GitHub Profile](#)

---

Thank you for using the UK Police Data Explorer!
