import os
import re
import sys
import random
import json

def get_base_path():
    # Determine the directory where the script/exe is located
    if getattr(sys, 'frozen', False):
        # Running as executable
        app_path = os.path.dirname(sys.executable)
    else:
        # Running as script
        app_path = os.path.dirname(os.path.abspath(__file__))
    return app_path

def parse_levels(filename):
    try:
        with open(filename, 'r', encoding='utf-8-sig') as f:
            lines = f.readlines()
    except UnicodeDecodeError:
        with open(filename, 'r', encoding='cp949') as f:
            lines = f.readlines()

    levels = {1: [], 2: [], 3: [], 4: [], 5: []}
    current_level = 0

    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        level_match = re.match(r"<Level\s+(\d+)>", line)
        if level_match:
            current_level = int(level_match.group(1))
            continue

        if current_level > 0:
            parts = line.split('||')
            if len(parts) >= 2:
                latex = parts[0].strip()
                solution = parts[1].strip()
                levels[current_level].append({
                    "latex": latex,
                    "solution": solution
                })
    return levels

def generate_collections(levels_data):
    # Requirement 1: Every collection must start with Level 1.
    # Requirement 2: Use ALL problems (maximize coverage).
    # Requirement 3: Target size ~20 (no hard limit).
    
    # Calculate total problem count
    total_problems = sum(len(p) for p in levels_data.values())
    if total_problems == 0:
        return []
        
    target_size = 20
    # Calculate optimal number of collections (rounding to nearest integer)
    num_collections = max(1, round(total_problems / target_size))
    
    # Ensure ensuring every collection gets at least one Level 1
    # if we have fewer Lv1 problems than calculated collections, we must reduce collections
    # to guarantee the rule "Every collection starts with Lv1".
    num_lv1 = len(levels_data.get(1, []))
    if num_lv1 < num_collections:
        print(f"Warning: Not enough Lv1 problems ({num_lv1}) for {num_collections} collections. Adjusting count.")
        num_collections = max(1, num_lv1)
        
    print(f"Generating {num_collections} collections from {total_problems} problems (Avg: {total_problems/num_collections:.1f})")

    buckets = [[] for _ in range(num_collections)]
    
    # Distribute problems level by level to ensure balanced difficulty
    for lv in range(1, 6):
        probs = levels_data.get(lv, [])
        # Shuffle order within the level
        random.shuffle(probs)
        
        # Distribute round-robin
        for i, p in enumerate(probs):
            bucket_idx = i % num_collections
            buckets[bucket_idx].append({**p, 'level': lv})
            
    # Finalize collections
    collections = []
    for i, bucket in enumerate(buckets):
        # Sort by level to ensure Lv1 comes first, then increasing difficulty
        bucket.sort(key=lambda x: x['level'])
        
        collections.append({
            "id": f"col{i+1}",
            "name": f"Collection {i+1}",
            "problems": bucket
        })
        
    return collections

def write_js(collections, filename):
    js_content = "window.generatedCollections = [\n"
    
    for col in collections:
        js_content += '    {\n'
        js_content += f'        id: "{col["id"]}",\n'
        js_content += f'        name: "{col["name"]}",\n'
        js_content += '        problems: [\n'
        for p in col['problems']:
            latex = p['latex'].replace('\\', '\\\\').replace('"', '\\"')
            solution = p['solution'].replace('\\', '\\\\').replace('"', '\\"')
            js_content += f'            {{ level: {p["level"]}, latex: "{latex}", solution: "{solution}" }},\n'
        js_content += '        ]\n'
        js_content += '    },\n'
    
    js_content += '];\n'

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"Generated {filename} with {len(collections)} collections.")

def main():
    app_path = get_base_path()
    
    # Candidate paths for 'problems/levels.txt'
    input_candidates = [
        os.path.join(app_path, "problems", "levels.txt"),
        os.path.join(os.path.dirname(app_path), "problems", "levels.txt")
    ]
    
    input_file = None
    for path in input_candidates:
        if os.path.exists(path):
            input_file = path
            break
            
    if input_file is None:
        print(f"Error: 'problems/levels.txt' not found.")
        print(f"Searched in:\n - {input_candidates[0]}\n - {input_candidates[1]}")
        input("Press Enter to close...") 
        return

    base_dir = os.path.dirname(input_file)
    output_file = os.path.join(base_dir, "collections.js")

    print(f"Reading from: {input_file}")
    levels_data = parse_levels(input_file)
    collections = generate_collections(levels_data)
    
    if len(collections) == 0:
        print("Warning: No complete collections could be generated. Check if there are enough problems for each level.")
        print("Required: Lv1:3, Lv2:3, Lv3:4, Lv4:5, Lv5:5")
    
    write_js(collections, output_file)
    input("Done. Press Enter to exit...")

if __name__ == "__main__":
    main()
