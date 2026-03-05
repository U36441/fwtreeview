# FW TreeView React App
## Overview
FW TreeView React App is a React-based application designed to visualize hierarchical JSON data in a clean and interactive tree structure. The application dynamically renders nested nodes from a JSON file and allows users to expand or collapse nodes to explore the hierarchy.
This project is useful for scenarios where structured data needs to be represented visually, such as configuration files, organizational hierarchies, category structures, or nested datasets.
The application reads a JSON structure and displays it in a tree format where each node can contain child nodes. If a node contains children, it can be expanded or collapsed. Leaf nodes (nodes without children) are displayed as terminal elements.
The project is built using modern frontend technologies including React, TypeScript, and Vite, providing a lightweight and fast development environment.
---
## Features
* Display hierarchical JSON data in a tree structure
* Expand and collapse nodes dynamically
* Supports multiple levels of nested nodes
* Automatically detects leaf nodes
* Clean and minimal user interface
* Efficient rendering of hierarchical data
* Works with any properly structured JSON file
---
## Technologies Used
The application is built using the following technologies:
* React
* TypeScript
* Vite
* React Flow (for visual node rendering)
* CSS for styling

These technologies provide a fast, modular, and scalable frontend architecture.
---
## Installation
Follow these steps to run the project locally.
### Clone the Repository
git clone https://github.com/U36441/fwtreeview.git
### Navigate to the Project Directory
cd fwtreeview
### Install Dependencies
npm install
---
## Running the Application
Start the development server using the following command:
npm run dev
After starting the server, open the following URL in your browser:
http://localhost:5173---

## JSON Data Format
The application expects the JSON file to follow a hierarchical structure where each node contains a label and optionally a list of children.
Example JSON format:

{
"label": "Root Node",
"children": [
{
"label": "Child Node 1",
"children": [
{
"label": "Grandchild 1",
"children": [
{ "label": "Great Grandchild 1" },
{ "label": "Great Grandchild 2" }
]
},
{
"label": "Grandchild 2"
}
]
},
{
"label": "Child Node 2"
}
]
}

Explanation:

* label represents the node name displayed in the UI.
* children represents nested nodes.
* If children are present, the node will show expand/collapse functionality.
* If children are not present, the node will be treated as a leaf node.
---
## Example Tree Representation
Root Node
├── Child Node 1
│    ├── Grandchild 1
│    │    ├── Great Grandchild 1
│    │    └── Great Grandchild 2
│    └── Grandchild 2
└── Child Node 2

---

## Project Structure
FW_Treeview
│
├── src
│   ├── components
│   │   ├── TreeNode.tsx
│   │   └── TreeView.tsx
│   │
│   ├── data
│   │   └── sample-tree.json
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
│
├── public
├── package.json
└── README.md

---

## Future Enhancements
Possible improvements for future versions of the project include:
* JSON file upload functionality
* Search capability within tree nodes
* Drag and drop node support
* Node editing and deletion
* Lazy loading for large tree structures
* Performance optimization for large datasets
---
## Author
Rajesh Kocharla
GitHub: https://github.com/U36441
---
## License
This project is licensed under the License.
