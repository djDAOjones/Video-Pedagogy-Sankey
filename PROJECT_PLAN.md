# Video Pedagogy Sankey Visualization - Project Plan

## Executive Summary
A web-based visualization tool for exploring academic theories, themes, and research around using video in pedagogy through interactive Sankey diagrams. The application enables researchers and educators to discover relevant research through dynamic filtering and visual navigation.

## Project Information
- **Repository:** https://github.com/djDAOjones/Video-Pedagogy-Sankey
- **Hosting:** GitHub Pages
- **Stack:** Free and open-source technologies
- **Target Users:** Educators, researchers, and students exploring video pedagogy

## Core Requirements

### Functional Requirements
1. **Dynamic Sankey Visualization**
   - Default flow: Theories → Themes → Studies
   - Configurable stage arrangement via dropdown selectors
   - Link thickness based on strength/weight (0-4 scale)
   - Collapsible groupings based on categories

2. **Filtering & Search Capabilities**
   - Link strength range filter (default: 2-4)
   - Global complexity slider (removes low-weight nodes)
   - Omit orphans checkbox (default: on)
   - Author-based filtering (future enhancement)
   - Text-based search functionality

3. **Display Optimization**
   - Automatic text sizing (long name/short name/hidden)
   - Logarithmic or scaled link sizing option
   - Minimum visibility thresholds
   - Responsive design for various screen sizes

4. **Export Functionality**
   - PNG export
   - PDF export
   - JSON settings export/import

5. **Information Display**
   - Hover modals with expanded information
   - Author information display
   - URLs and video explainer links
   - Descriptions when available

### Non-Functional Requirements
- **Accessibility:** WCAG 2.1 AA compliance
- **Performance:** Smooth interactions with 100+ nodes
- **Sustainability:** Clean, maintainable code structure
- **Compatibility:** Modern browsers (Chrome, Firefox, Safari, Edge)

## Technical Architecture

### Technology Stack
```
Frontend Framework: React 18+ (or vanilla JS with D3)
Visualization: D3.js v7 for Sankey diagrams
Styling: TailwindCSS or CSS Modules
Build Tool: Vite or Webpack
Testing: Jest + React Testing Library
CI/CD: GitHub Actions
Hosting: GitHub Pages
```

### Data Structure
```
nodes: {
  id: string (unique identifier)
  node_class: "Theory" | "Theme" | "Study"
  label_short: string
  label_long: string
  category: string (for grouping)
  authors?: string
  year?: number
  url?: string
  url_page?: string
  url_video?: string
  description?: string
}

links: {
  source: string (node id)
  target: string (node id)
  weight: number (0-4)
}
```

### Component Architecture
```
App
├── Header
│   └── Title
├── SankeyChart
│   ├── D3Sankey
│   ├── Tooltip
│   └── ContextMenu
├── Controls
│   ├── StageSelector
│   ├── FilterPanel
│   │   ├── StrengthRangeSlider
│   │   ├── ComplexitySlider
│   │   └── OrphanToggle
│   ├── DisplayOptions
│   │   ├── ScalingMode
│   │   └── CollapseGroups
│   └── ExportPanel
└── Footer
```

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project scaffolding and build setup
- [ ] Data loading and parsing system
- [ ] Basic Sankey diagram implementation
- [ ] Default view (Theories → Themes → Studies)
- [ ] Basic responsiveness

### Phase 2: Core Interactivity (Week 3-4)
- [ ] Stage arrangement selector
- [ ] Link strength filtering (2-handle slider)
- [ ] Orphan node filtering
- [ ] Category-based collapsing
- [ ] Hover tooltips with basic information

### Phase 3: Display Optimization (Week 5-6)
- [ ] Dynamic text sizing based on space
- [ ] Link scaling modes (linear/log)
- [ ] Complexity slider implementation
- [ ] Visual polish and animations
- [ ] Mobile responsiveness

### Phase 4: Advanced Features (Week 7-8)
- [ ] Export functionality (PNG, PDF, JSON)
- [ ] Settings persistence
- [ ] Expanded information modals
- [ ] Search functionality
- [ ] Author filtering

### Phase 5: Enhancement & Testing (Week 9-10)
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Documentation
- [ ] User testing and feedback incorporation

## Interface Design Considerations

### Layout Structure
```
┌─────────────────────────────────────┐
│            HEADER/TITLE             │
├─────────────────────────────────────┤
│                                     │
│         SANKEY VISUALIZATION        │
│                                     │
│                                     │
├─────────────────────────────────────┤
│           CONTROL PANEL             │
│  [Filters] [Display] [Export]      │
└─────────────────────────────────────┘
```

### Color & Visual Design Questions
1. **Node Coloring Strategies:**
   - By class (Theory/Theme/Study)?
   - By category/grouping?
   - By connection strength?
   - User-selectable schemes?

2. **Pattern Applications:**
   - Differentiate node types with patterns?
   - Indicate filtered/hidden connections?
   - Accessibility patterns for colorblind users?

3. **Visual Hierarchy:**
   - How to emphasize strong connections?
   - Visual differentiation for collapsed groups?
   - Highlighting on hover/selection?

### Interaction Patterns
- **Click:** Select/focus node
- **Hover:** Show tooltip
- **Drag:** Pan diagram (if needed)
- **Scroll:** Zoom (with modifier key)
- **Double-click:** Expand/collapse group

## Key Design Decisions Needed

### 1. Framework Choice
**Option A: React + D3**
- Pros: Component reusability, state management, large ecosystem
- Cons: Larger bundle size, learning curve

**Option B: Vanilla JS + D3**
- Pros: Smaller bundle, direct control, simpler deployment
- Cons: More manual state management

**Recommendation:** React + D3 for maintainability and future extensibility

### 2. Data Management
- Should we implement a data preprocessing step?
- Consider building a data validation tool?
- Future: Admin interface for data editing?

### 3. Visual Encoding
- Primary color scheme approach?
- How to handle overlapping labels?
- Animation strategy for transitions?

### 4. Performance Thresholds
- Maximum nodes before simplification?
- Debouncing strategy for filters?
- Lazy loading for large datasets?

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance with large datasets | High | Implement virtual rendering, data pagination |
| Browser compatibility | Medium | Progressive enhancement, polyfills |
| Accessibility compliance | High | Early testing, semantic HTML, ARIA labels |
| Data quality issues | Medium | Validation layer, error handling |
| Complex interaction patterns | Medium | User testing, clear documentation |

## Success Metrics
- Page load time < 3 seconds
- Smooth interactions (60 fps)
- Zero accessibility violations
- Mobile-friendly (works on tablets/phones)
- Positive user feedback on usability

## Future Enhancements
1. **Data Management Interface**
   - Web-based editor for nodes/links
   - Bulk import/export tools
   - Version control for datasets

2. **Advanced Analytics**
   - Path finding between nodes
   - Cluster analysis
   - Temporal evolution views

3. **Collaboration Features**
   - Shareable views with URL parameters
   - Annotation system
   - User accounts for saved configurations

4. **Integration Capabilities**
   - API for external data sources
   - Embedding widget for other sites
   - Export to other visualization formats

## Technical Specifications

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Targets
- Initial load: < 3s
- Interaction response: < 100ms
- Re-render on filter: < 500ms
- Export generation: < 2s

### Accessibility Standards
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Environment Variables
```env
VITE_APP_TITLE=Video Pedagogy Sankey
VITE_APP_VERSION=1.0.0
VITE_PUBLIC_URL=/Video-Pedagogy-Sankey/
```

### Folder Structure
```
/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── styles/
│   └── data/
├── public/
├── tests/
├── docs/
└── scripts/
```

## Questions for Stakeholder Review

1. **Priority Features:** Which features are must-have vs nice-to-have for MVP?
2. **Color Semantics:** Preferred approach for color usage and meaning?
3. **Data Updates:** How frequently will data be updated? Manual or automated?
4. **User Analytics:** Should we track usage patterns?
5. **Collaboration:** Need for multi-user features or sharing mechanisms?
6. **Mobile Priority:** How important is mobile/tablet experience?
7. **Offline Support:** Should the app work offline once loaded?

## Next Steps
1. Review and approve technology stack
2. Finalize MVP feature set
3. Create detailed wireframes/mockups
4. Set up development environment
5. Begin Phase 1 implementation

---

*Document Version: 1.0*
*Last Updated: [Current Date]*
*Status: Draft - Pending Review*