# Video Pedagogy Sankey Visualization

An interactive web application for visualizing connections between academic theories, themes, and research studies in video pedagogy through dynamic Sankey diagrams.

🔗 **Live Demo**: [https://djdaojones.github.io/Video-Pedagogy-Sankey](https://djdaojones.github.io/Video-Pedagogy-Sankey)

## Features

- **Interactive Sankey Diagram**: Visualize relationships between theories, themes, and studies
- **Configurable Flow**: Rearrange the order of stages (Theory → Theme → Study)
- **Advanced Filtering**: 
  - Link strength range filter (0-4 scale)
  - Complexity slider for simplification
  - Orphan node removal
- **Smart Display**:
  - Dynamic text sizing (long/short/hidden)
  - Multiple link scaling modes (linear/logarithmic/square-root)
  - Collapsible category groups
- **Export Options**:
  - PNG image export
  - PDF document export
  - JSON settings for saving/loading configurations
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

## Quick Start

### Prerequisites

- Node.js 18+ and npm installed
- Git installed

### Installation

1. Clone the repository:
```bash
git clone https://github.com/djDAOjones/Video-Pedagogy-Sankey.git
cd Video-Pedagogy-Sankey
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploying to GitHub Pages

```bash
npm run deploy
```

This will build the project and deploy it to GitHub Pages.

## Data Structure

The visualization uses two CSV files located in `/public/Data/`:

### data_nodes_v2.csv
Contains information about theories, themes, and studies:
- `id`: Unique identifier
- `node_class`: Type (Theory/Theme/Study)
- `label_short`: Abbreviated label
- `label_long`: Full descriptive label
- `category`: Grouping category
- `authors`: Author information
- `year`: Publication year
- `url`, `url_page`, `url_video`: Related links
- `description`: Detailed description

### data_links_v2.csv
Defines connections between nodes:
- `source`: Source node ID
- `target`: Target node ID
- `weight`: Connection strength (0-4)

## Usage Guide

### Basic Navigation
1. **Hover** over nodes to see detailed information
2. **Click** nodes to focus and highlight connections
3. Use the **control panel** below the chart to adjust settings

### Filtering Options
- **Link Strength**: Adjust the range slider to show only connections within a certain strength
- **Complexity**: Use the slider to simplify the visualization by removing low-weight nodes
- **Omit Orphans**: Toggle to hide unconnected nodes

### Display Options
- **Link Scaling**: Choose between linear, logarithmic, or square-root scaling
- **Collapse Groups**: Group nodes by category to reduce visual complexity
- **Show Labels**: Toggle node labels on/off

### Stage Configuration
Use the dropdown selectors to rearrange the flow order, or choose from presets:
- Default: Theory → Theme → Study
- Reverse: Study → Theme → Theory
- Theme-Centered: Theme → Theory → Study
- Study-First: Study → Theory → Theme

### Exporting
- **PNG**: Export the current view as an image
- **PDF**: Generate a PDF document with the visualization
- **Settings**: Save your current configuration as JSON
- **Load Settings**: Import a previously saved configuration

## Technology Stack

- **Frontend**: React 18
- **Visualization**: D3.js v7 + d3-sankey
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Data Parsing**: PapaParse
- **Export**: html2canvas, jsPDF, FileSaver.js
- **Deployment**: GitHub Pages

## Project Structure

```
Video-Pedagogy-Sankey/
├── public/
│   └── Data/           # CSV data files
├── src/
│   ├── components/     # React components
│   │   ├── controls/   # Control panel components
│   │   ├── Header.jsx
│   │   ├── SankeyChart.jsx
│   │   ├── Tooltip.jsx
│   │   └── ControlPanel.jsx
│   ├── utils/          # Utility functions
│   │   ├── dataLoader.js
│   │   ├── dataFilter.js
│   │   └── exportUtils.js
│   ├── App.jsx         # Main application
│   └── main.jsx        # Entry point
├── package.json
├── vite.config.js
└── README.md
```

## Development

### Adding New Data

1. Edit the CSV files in `/Data/` folder
2. Ensure node IDs in links match those in nodes
3. Validate weight values are between 0-4
4. Copy updated CSVs to `/public/Data/`

### Customizing Appearance

Edit the Tailwind configuration in `tailwind.config.js`:
- Modify color schemes for theories, themes, and studies
- Adjust animations and transitions
- Add custom utility classes

### Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Blank visualization**
- Check browser console for errors
- Verify CSV files are in `/public/Data/`
- Ensure node IDs in links match node definitions

**Export not working**
- Ensure pop-up blockers are disabled
- Check browser compatibility
- Try different export format

**Performance issues**
- Reduce complexity slider value
- Enable orphan filtering
- Use logarithmic link scaling

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with React and D3.js
- Inspired by academic research visualization needs
- Data structure based on video pedagogy research literature

## Contact

For questions or suggestions, please open an issue on GitHub.

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Maintainer**: djDAOjones