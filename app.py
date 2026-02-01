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
    """Solve TSP using Held-Karp dynamic programming (exact solution for small instances)."""
    n = len(cities)
    if n == 0:
        return [], 0
    if n == 1:
        return [0], 0
    
    # For larger instances, fall back to nearest neighbor
    if n > 12:
        return nearest_neighbor_tsp(cities)
    
    # Distance matrix
    dist = [[calculate_distance(cities[i], cities[j]) for j in range(n)] for i in range(n)]
    
    # DP table: dp[mask][i] = (min_cost, parent)
    # mask represents visited cities, i is current city
    dp = {}
    
    # Base case: start from city 0
    for i in range(1, n):
        dp[(1 << i, i)] = (dist[0][i], 0)
    
    # Fill DP table
    for size in range(2, n):
        for subset in combinations_of_size(n, size):
            if 0 in subset:
                continue
            mask = 0
            for city in subset:
                mask |= (1 << city)
            
            for i in subset:
                prev_mask = mask & ~(1 << i)
                candidates = []
                
                for j in subset:
                    if j != i and (prev_mask, j) in dp:
                        cost = dp[(prev_mask, j)][0] + dist[j][i]
                        candidates.append((cost, j))
                
                if candidates:
                    dp[(mask, i)] = min(candidates)
    
    # Find minimum cost to return to start
    full_mask = (1 << n) - 2  # All cities except 0
    candidates = []
    
    for i in range(1, n):
        if (full_mask, i) in dp:
            cost = dp[(full_mask, i)][0] + dist[i][0]
            candidates.append((cost, i))
    
    if not candidates:
        return nearest_neighbor_tsp(cities)
    
    min_cost, last = min(candidates)
    
    # Reconstruct path
    route = [0]
    mask = full_mask
    current = last
    
    while mask:
        route.append(current)
        if (mask, current) not in dp:
            break
        prev = dp[(mask, current)][1]
        mask &= ~(1 << current)
        current = prev
    
    route.reverse()
    route = [0] + route
    
    return route, min_cost

def combinations_of_size(n, size):
    """Generate all combinations of cities of given size."""
    from itertools import combinations
    return list(combinations(range(1, n), size))

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
