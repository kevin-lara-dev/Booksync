#!/bin/bash
# strip null bytes que el linter de VS Code inyecta, luego corre jest

python3 -c "
import os, glob

targets = glob.glob('tests/*.test.js') + glob.glob('src/**/*.js', recursive=True)
for path in targets:
    try:
        with open(path, 'rb') as f:
            content = f.read()
        if b'\x00' in content:
            clean = content.replace(b'\x00', b'')
            with open(path, 'wb') as f:
                f.write(clean)
            print(f'cleaned: {path}')
    except Exception as e:
        pass
"

node_modules/.bin/jest "$@"
