import json
import re
import random
import os
import sys

# Get the directory where the script (or exe) is located
if getattr(sys, 'frozen', False):
    base_dir = os.path.dirname(sys.executable)
else:
    base_dir = os.path.dirname(os.path.abspath(__file__))

input_file = os.path.join(base_dir, "problems", "levels.txt")
output_file = os.path.join(base_dir, "problems", "collections.js")

def parse_levels(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    levels = {1: [], 2: [], 3: [], 4: [], 5: []}
    current_level = 0

    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        level_match = re.match(r"<Level (\d+)>", line)
        if level_match:
            current_level = int(level_match.group(1))
            continue

        if current_level > 0:
            parts = line.split('||')
            if len(parts) == 2:
                latex = parts[0].strip()
                solution = parts[1].strip()
                levels[current_level].append({
                    "latex": latex,
                    "solution": solution
                })
    return levels

def generate_collections(levels_data):
    # Required distribution: Lv1:3, Lv2:3, Lv3:4, Lv4:5, Lv5:5
    distribution = {1: 3, 2: 3, 3: 4, 4: 5, 5: 5}
    
    # Shuffle all pools
    for lv in levels_data:
        random.shuffle(levels_data[lv])
    
    collections = []
    collection_id = 1
    
    while True:
        current_collection_problems = []
        possible = True
        
        # Try to fill a collection
        for lv in range(1, 6):
            count_needed = distribution[lv]
            if len(levels_data[lv]) >= count_needed:
                # Take problems from the pool
                chunk = levels_data[lv][:count_needed]
                current_collection_problems.extend([{**p, 'level': lv} for p in chunk])
                # Remove from pool
                levels_data[lv] = levels_data[lv][count_needed:]
            else:
                # Not enough data for this level to make a full set
                possible = False
                break
        
        if possible:
            # Sort by level for the test
            current_collection_problems.sort(key=lambda x: x['level'])
            collections.append({
                "id": f"col{collection_id}",
                "name": f"Collection {collection_id}",
                "problems": current_collection_problems
            })
            collection_id += 1
        else:
            break
            
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

levels_data = parse_levels(input_file)
collections = generate_collections(levels_data)
write_js(collections, output_file)
print(f"Successfully created {len(collections)} collections in {output_file}")
