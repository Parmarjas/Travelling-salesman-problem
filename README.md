# TSP Voyager - Interactive Traveling Salesman Problem Visualizer

An advanced web-based visualization tool for the Traveling Salesman Problem (TSP) featuring dynamic zoom/pan capabilities, interactive city placement, and multiple solving algorithms.

![TSP Voyager](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)

## 🎯 Features

### Interactive Canvas
- **Smooth Zoom & Pan**: Mouse wheel zoom with intelligent pan controls
- **Dynamic Grid System**: Automatically adjusting grid lines and spacing based on zoom level
- **Real-time Coordinate Mapping**: Accurate conversion between canvas and graph coordinates
- **Responsive Design**: Adapts to different screen sizes

### City Management
- **Click-to-Place Cities**: Intuitive city placement with visual feedback
- **Coordinate Display**: Real-time cursor position in graph coordinates
- **City Labels**: Auto-numbered cities for easy identification
- **Clear Functionality**: Reset canvas without page reload

### TSP Algorithms
1. **Nearest Neighbor (Heuristic)**: Fast approximation, works for any number of cities
2. **Held-Karp (Dynamic Programming)**: Exact solution for ≤12 cities
3. **Brute Force**: Exact solution for ≤10 cities (exhaustive search)

### Visualization
- **Animated Route Drawing**: Smooth animation when solution is found
- **Direction Arrows**: Visual indicators showing route direction
- **Distance Calculation**: Real-time total route distance display
- **Glowing Effects**: Cyberpunk-inspired visual design

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Clone or Download
```bash
# If you have the project folder, navigate to it
cd tsp-voyager
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install Flask==3.0.0 Werkzeug==3.0.1
```

### Step 3: Run the Application
```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

### Step 4: Open in Browser
Navigate to: `http://localhost:5000`

## 📖 Usage Guide

### Adding Cities
1. Ensure "Add Cities" mode is active (cyan highlighted button)
2. Click anywhere on the canvas to place cities
3. Cities are automatically numbered starting from 0
4. View coordinates in the bottom info bar

### Navigating the Canvas
- **Zoom In/Out**: Use mouse wheel or zoom buttons
- **Pan**: Switch to "Pan View" mode and drag the canvas
- **Reset View**: Click "Reset View" to return to default zoom/position

### Solving TSP
1. Add at least 2 cities to the canvas
2. Select an algorithm from the dropdown:
   - **Nearest Neighbor**: Recommended for quick results
   - **Held-Karp**: Best for exact solutions with ≤12 cities
   - **Brute Force**: Exact solution for ≤10 cities (slower)
3. Click "Solve TSP"
4. Watch the animated route drawing
5. View total distance in the stats bar

### Clearing the Canvas
Click "Clear All" to remove all cities and routes

## 🎨 Design Features

The application features a distinctive **cyberpunk/sci-fi aesthetic**:
- Custom "Orbitron" and "Bebas Neue" fonts
- Neon cyan (#00ffcc) and magenta (#ff00ff) color scheme
- Glowing effects and smooth animations
- Grid overlay with scanline effect
- Professional dark theme optimized for long viewing sessions

## 🔧 Technical Details

### Project Structure
```
tsp-voyager/
├── app.py                 # Flask backend & TSP algorithms
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── style.css         # Styling & animations
    └── script.js         # Canvas interactions & rendering
```

### Algorithm Complexity
- **Nearest Neighbor**: O(n²) time, O(n) space
- **Held-Karp**: O(n² × 2ⁿ) time, O(n × 2ⁿ) space
- **Brute Force**: O(n!) time, O(n) space

### Canvas Architecture
- **Coordinate System**: Cartesian grid with origin at center
- **Zoom Range**: 10% to 1000%
- **Grid Spacing**: Dynamically adjusts (25-200 units)
- **Rendering**: HTML5 Canvas API with requestAnimationFrame

## 🎓 Educational Use

This project is perfect for:
- Computer Science coursework on algorithms
- Algorithm visualization demonstrations
- Understanding NP-hard problems
- Learning about heuristics vs exact solutions
- Web development portfolio projects

## 🐛 Troubleshooting

### Application won't start
- Ensure Python 3.8+ is installed: `python --version`
- Check if Flask is installed: `pip list | grep Flask`
- Verify port 5000 is not in use

### Canvas not responding
- Check browser console for JavaScript errors (F12)
- Try a different browser
- Clear browser cache

### Routes look incorrect
- Ensure at least 2 cities are placed
- Try a different algorithm
- For large datasets (>12 cities), Held-Karp falls back to Nearest Neighbor

## 📝 Assignment Submission Notes

### Key Accomplishments
✅ Interactive canvas with zoom and pan  
✅ Dynamic Cartesian grid with axis labels  
✅ User-driven city placement  
✅ Multiple TSP solving algorithms  
✅ Accurate coordinate mapping  
✅ Clear and reset functionality  
✅ Responsive UI with real-time feedback  
✅ Route animation and visualization  
✅ Distance calculation and display  

### Extensions Implemented
- Route animation with smooth transitions
- Direction arrows showing path flow
- Multiple algorithm options
- Real-time statistics display
- Professional UI design
- Keyboard/mouse controls

## 🔮 Future Enhancements (Optional)

- [ ] Save/load city configurations to JSON
- [ ] Drag and drop to reposition cities
- [ ] Step-by-step algorithm animation
- [ ] Comparison mode (run multiple algorithms)
- [ ] Export route as image
- [ ] Import cities from CSV
- [ ] 3D visualization mode
- [ ] Mobile touch support optimization

## 📄 License

This project is created for educational purposes. Feel free to modify and use for your coursework.

## 👨‍💻 Author

Created as a college project for demonstrating interactive data visualization and algorithm implementation.

---

**Note**: This application runs entirely locally - no internet connection required after initial setup!
