from flask import Flask, render_template, request, jsonify
import math
from itertools import permutations

app = Flask(__name__)

def calculate_distance(city1, city2):
    """Calculate Euclidean distance between two cities."""
    return math.sqrt((city1['x'] - city2['x'])**2 + (city1['y'] - city2['y'])**2)

def calculate_total_distance(route, cities):
    """Calculate total distance of a route."""
    total = 0
    for i in range(len(route)):
        total += calculate_distance(cities[route[i]], cities[route[(i + 1) % len(route)]])
    return total

def nearest_neighbor_tsp(cities):
    """Solve TSP using Nearest Neighbor heuristic."""
    if len(cities) == 0:
        return [], 0
    
    n = len(cities)
    unvisited = set(range(n))
    route = [0]
    unvisited.remove(0)
    
    while unvisited:
        last = route[-1]
        nearest = min(unvisited, key=lambda x: calculate_distance(cities[last], cities[x]))
        route.append(nearest)
        unvisited.remove(nearest)
    
    total_distance = calculate_total_distance(route, cities)
    return route, total_distance

def held_karp_tsp(cities):
    # Number of cities
    n = len(cities)

    # Precompute distance between every pair of cities
    dist = [[math.hypot(cities[i]['x'] - cities[j]['x'],
                        cities[i]['y'] - cities[j]['y'])
             for j in range(n)] for i in range(n)]

    # DP table:
    # dp[(mask, i)] = (min_cost, previous_city)
    dp = {}

    # Base case:
    # Path starts at city 0 and goes directly to city i
    for i in range(1, n):
        dp[(1 << i, i)] = (dist[0][i], 0)

    # Build solutions for subsets of increasing size
    for size in range(2, n):
        # Generate all subsets of cities (excluding city 0)
        for subset in combinations(range(1, n), size):
            # Convert subset to bitmask
            mask = sum(1 << i for i in subset)

            # Try ending the path at each city i in the subset
            for i in subset:
                prev_mask = mask ^ (1 << i)

                # Choose the best previous city j
                dp[(mask, i)] = min(
                    (dp[(prev_mask, j)][0] + dist[j][i], j)
                    for j in subset if j != i
                )

    # Mask representing all cities visited except city 0
    full_mask = (1 << n) - 2

    # Find minimum cost to return back to city 0
    min_cost, last_city = min(
        (dp[(full_mask, i)][0] + dist[i][0], i)
        for i in range(1, n)
    )

    # Reconstruct the optimal path
    route = [0]
    mask, current = full_mask, last_city

    while mask:
        route.append(current)
        _, prev_city = dp[(mask, current)]
        mask ^= (1 << current)
        current = prev_city

    # Return path starting and ending at city 0
    return route[::-1] + [0], min_cost

def brute_force_tsp(cities):
    """Solve TSP using brute force (only for very small instances)."""
    n = len(cities)
    if n == 0:
        return [], 0
    if n == 1:
        return [0], 0
    if n > 10:
        return nearest_neighbor_tsp(cities)
    
    min_route = None
    min_distance = float('inf')
    
    # Generate all permutations of cities (excluding the starting city)
    for perm in permutations(range(1, n)):
        route = [0] + list(perm)
        distance = calculate_total_distance(route, cities)
        if distance < min_distance:
            min_distance = distance
            min_route = route
    
    return min_route, min_distance

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.json
    cities = data.get('cities', [])
    algorithm = data.get('algorithm', 'nearest_neighbor')
    
    if len(cities) == 0:
        return jsonify({'error': 'No cities provided'}), 400
    
    if algorithm == 'nearest_neighbor':
        route, distance = nearest_neighbor_tsp(cities)
    elif algorithm == 'held_karp':
        route, distance = held_karp_tsp(cities)
    elif algorithm == 'brute_force':
        route, distance = brute_force_tsp(cities)
    else:
        route, distance = nearest_neighbor_tsp(cities)
    
    return jsonify({
        'route': route,
        'distance': round(distance, 2)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
