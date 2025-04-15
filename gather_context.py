import os
import datetime
import fnmatch # For pattern matching ignored files/dirs

# --- Configuration ---
OUTPUT_FILENAME = "code_context.md"
PROJECT_ROOT = os.getcwd() # Assumes script is run from project root

# Directories to explicitly scan for source code
# Add more if needed (e.g., 'packages/shared-utils/src')
DIRECTORIES_TO_SCAN = [
    os.path.join('packages', 'backend', 'src'),
    os.path.join('packages', 'customer-frontend', 'src'),
    os.path.join('packages', 'admin-frontend', 'src'), # Will be skipped if it doesn't exist
]

# Specific important files to include (relative to project root)
IMPORTANT_FILES = [
    'project_docs.txt',
    'package.json', # Root package.json
    os.path.join('packages', 'backend', 'package.json'),
    os.path.join('packages', 'customer-frontend', 'package.json'),
    os.path.join('packages', 'admin-frontend', 'package.json'), # Will be skipped if not found
    os.path.join('packages', 'backend', 'prisma', 'schema.prisma'),
    os.path.join('packages', 'backend', 'tsconfig.json'), # Backend tsconfig
    os.path.join('packages', 'customer-frontend', 'tsconfig.json'), # Customer FE tsconfig
    os.path.join('packages', 'admin-frontend', 'tsconfig.json'), # Admin FE tsconfig
    os.path.join('packages', 'customer-frontend', 'postcss.config.js'), # Example specific config
    os.path.join('packages', 'admin-frontend', 'postcss.config.js'), # Example specific config
]

# File extensions to include when scanning directories
# Add other extensions if needed (e.g., '.py', '.java', '.html')
RELEVANT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.prisma', '.md', '.txt']

# --- Ignored items ---
# Directories to completely ignore (basename matching)
IGNORED_DIRS_BASE = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.vscode',
    '.idea',
    '__pycache__',
    '.next', # Example for Next.js if used later
    '.cache',
    'coverage',
]

# Specific files to ignore by name (basename matching)
IGNORED_FILES_BASE = [
    'package-lock.json',
    'pnpm-lock.yaml',
    '.env', # IMPORTANT: Ignore environment files
    '.DS_Store',
    OUTPUT_FILENAME, # Don't include the output file itself
]
# Add wildcard patterns if needed
IGNORED_FILE_PATTERNS = [
    '*.log',
    '*.svg', # Usually not useful for code context
    '*.png', '*.jpg', '*.jpeg', '*.gif', '*.webp', # Images
    '*.ico',
    '*.lock', # Generic lock files
]
# --- End Configuration ---


def get_markdown_language_hint(extension):
    """Maps file extension to Markdown language hint."""
    mapping = {
        '.ts': 'typescript',
        '.tsx': 'tsx',
        '.js': 'javascript',
        '.jsx': 'jsx',
        '.json': 'json',
        '.css': 'css',
        '.html': 'html',
        '.py': 'python',
        '.prisma': 'prisma', # Or potentially 'sql' depending on highlighting needs
        '.md': 'markdown',
        '.txt': 'text',
        '.sh': 'bash',
        '.yaml': 'yaml',
        '.yml': 'yaml',
        '.xml': 'xml',
    }
    return mapping.get(extension.lower(), '') # Return empty string if no hint found


def should_ignore(path, is_dir):
    """Checks if a given path should be ignored based on config."""
    basename = os.path.basename(path)

    if is_dir:
        return basename in IGNORED_DIRS_BASE

    # Check specific filenames first
    if basename in IGNORED_FILES_BASE:
        return True

    # Check wildcard patterns
    for pattern in IGNORED_FILE_PATTERNS:
        if fnmatch.fnmatch(basename, pattern):
            return True

    # Check if it's in a relevant directory scan and has a relevant extension
    # This check is mainly done during the os.walk part, not needed here usually.
    # _, extension = os.path.splitext(basename)
    # if extension.lower() not in RELEVANT_EXTENSIONS:
    #    return True # Ignore if scanning and extension is not relevant

    return False


def append_file_content(filepath, output_file):
    """Appends formatted file content to the output markdown file."""
    relative_path = os.path.relpath(filepath, PROJECT_ROOT).replace("\\", "/") # Use forward slashes

    if not os.path.exists(filepath):
        print(f"Warning: File not found, skipping: {relative_path}")
        return False

    if should_ignore(filepath, is_dir=False):
        print(f"Info: Ignoring file explicitly: {relative_path}")
        return False

    print(f"Appending: {relative_path}")
    _, extension = os.path.splitext(filepath)
    lang_hint = get_markdown_language_hint(extension)

    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as infile:
            content = infile.read()

        output_file.write("---\n")
        output_file.write(f"### File: `{relative_path}`\n\n")
        output_file.write(f"```{lang_hint}\n")
        output_file.write(content.strip()) # Strip leading/trailing whitespace from content
        output_file.write("\n```\n\n")
        return True
    except Exception as e:
        print(f"Error reading file {relative_path}: {e}")
        return False


def main():
    """Main function to generate the context file."""
    start_time = datetime.datetime.now()
    print("Starting code context generation...")
    print(f"Output file: {OUTPUT_FILENAME}")

    processed_files = set() # Keep track of files already added

    try:
        with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as outfile:
            outfile.write(f"# Project Code Context ({start_time.strftime('%Y-%m-%d %H:%M:%S')})\n\n")

            # 1. Add important specific files first
            outfile.write("## Key Configuration Files\n\n")
            for rel_path in IMPORTANT_FILES:
                full_path = os.path.join(PROJECT_ROOT, rel_path)
                if append_file_content(full_path, outfile):
                    processed_files.add(os.path.normpath(full_path))

            # 2. Scan specified directories
            outfile.write("## Source Code Files\n\n")
            for rel_dir in DIRECTORIES_TO_SCAN:
                scan_dir = os.path.join(PROJECT_ROOT, rel_dir)
                if not os.path.isdir(scan_dir):
                    print(f"Info: Scan directory not found, skipping: {rel_dir}")
                    continue

                print(f"Scanning directory: {rel_dir}")
                for root, dirs, files in os.walk(scan_dir, topdown=True):
                    # Prune ignored directories
                    dirs[:] = [d for d in dirs if not should_ignore(os.path.join(root, d), is_dir=True)]

                    for filename in files:
                        _, extension = os.path.splitext(filename)
                        if extension.lower() in RELEVANT_EXTENSIONS:
                            full_path = os.path.join(root, filename)
                            norm_path = os.path.normpath(full_path)
                            # Check if already processed (e.g., if it was in IMPORTANT_FILES)
                            if norm_path not in processed_files:
                                if append_file_content(full_path, outfile):
                                    processed_files.add(norm_path)
                        # else: # Optionally print skipped files
                        #     print(f"Skipping (extension): {os.path.join(root, filename)}")


            outfile.write("---\n")
            outfile.write("--- End of Context ---\n")

        end_time = datetime.datetime.now()
        duration = end_time - start_time
        print("\nCode context generation complete!")
        print(f"Processed {len(processed_files)} files.")
        print(f"Output written to: {OUTPUT_FILENAME}")
        print(f"Duration: {duration}")
        print("\nIMPORTANT: Please review the generated file for any sensitive data before sharing.")

    except Exception as e:
        print(f"\nAn error occurred during script execution: {e}")

if __name__ == "__main__":
    main()