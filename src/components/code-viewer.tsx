"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, File, Folder, Copy, Check } from "lucide-react";

interface FileTreeProps {
    files: Record<string, string>;
    onFileSelect: (path: string) => void;
    selectedFile: string | null;
}

interface TreeNode {
    name: string;
    path: string;
    isDirectory: boolean;
    children: TreeNode[];
}

function buildTree(files: Record<string, string>): TreeNode[] {
    const root: TreeNode[] = [];

    Object.keys(files).sort().forEach((filePath) => {
        const parts = filePath.split("/");
        let currentLevel = root;

        parts.forEach((part, index) => {
            const isLast = index === parts.length - 1;
            const existingNode = currentLevel.find((n) => n.name === part);

            if (existingNode) {
                currentLevel = existingNode.children;
            } else {
                const newNode: TreeNode = {
                    name: part,
                    path: isLast ? filePath : parts.slice(0, index + 1).join("/"),
                    isDirectory: !isLast,
                    children: [],
                };
                currentLevel.push(newNode);
                currentLevel = newNode.children;
            }
        });
    });

    return root;
}

function TreeItem({
    node,
    depth,
    onSelect,
    selectedPath,
    expandedPaths,
    onToggle
}: {
    node: TreeNode;
    depth: number;
    onSelect: (path: string) => void;
    selectedPath: string | null;
    expandedPaths: Set<string>;
    onToggle: (path: string) => void;
}) {
    const isExpanded = expandedPaths.has(node.path);
    const isSelected = selectedPath === node.path;

    return (
        <div>
            <button
                onClick={() => {
                    if (node.isDirectory) {
                        onToggle(node.path);
                    } else {
                        onSelect(node.path);
                    }
                }}
                className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs hover:bg-[#1f1f1f] transition-colors ${isSelected ? "bg-[#1f1f1f] text-lime-400" : "text-[#aaa]"
                    }`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                {node.isDirectory ? (
                    <>
                        {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-[#666]" />
                        ) : (
                            <ChevronRight className="w-3 h-3 text-[#666]" />
                        )}
                        <Folder className="w-3.5 h-3.5 text-[#888]" />
                    </>
                ) : (
                    <>
                        <span className="w-3" />
                        <File className="w-3.5 h-3.5 text-[#666]" />
                    </>
                )}
                <span className="truncate">{node.name}</span>
            </button>
            {node.isDirectory && isExpanded && (
                <div>
                    {node.children.map((child) => (
                        <TreeItem
                            key={child.path}
                            node={child}
                            depth={depth + 1}
                            onSelect={onSelect}
                            selectedPath={selectedPath}
                            expandedPaths={expandedPaths}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function FileTree({ files, onFileSelect, selectedFile }: FileTreeProps) {
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(["src", "src/app", "src/components"]));

    const tree = useMemo(() => buildTree(files), [files]);

    const handleToggle = (path: string) => {
        setExpandedPaths((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    return (
        <div className="h-full overflow-auto">
            <div className="py-2">
                {tree.map((node) => (
                    <TreeItem
                        key={node.path}
                        node={node}
                        depth={0}
                        onSelect={onFileSelect}
                        selectedPath={selectedFile}
                        expandedPaths={expandedPaths}
                        onToggle={handleToggle}
                    />
                ))}
            </div>
        </div>
    );
}

interface CodeViewerProps {
    code: string;
    filename: string;
}

export function CodeViewer({ code, filename }: CodeViewerProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Get file extension for basic syntax class
    const ext = filename.split(".").pop() || "";
    const isJsx = ["tsx", "jsx"].includes(ext);
    const isTs = ["ts", "tsx"].includes(ext);
    const isCss = ext === "css";
    const isJson = ext === "json";

    // Add line numbers
    const lines = code.split("\n");

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f1f1f] bg-[#0f0f0f]">
                <span className="text-xs font-mono text-lime-400">{filename}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[#888] hover:text-white hover:bg-[#1f1f1f] transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code */}
            <div className="flex-1 overflow-auto bg-[#0a0a0a]">
                <pre className="p-4 text-sm font-mono leading-relaxed">
                    {lines.map((line, i) => (
                        <div key={i} className="flex">
                            <span className="w-10 flex-shrink-0 text-right pr-4 text-[#444] select-none">
                                {i + 1}
                            </span>
                            <code className={`flex-1 ${isJsx || isTs ? "text-[#e6e6e6]" :
                                    isCss ? "text-[#9cdcfe]" :
                                        isJson ? "text-[#ce9178]" :
                                            "text-[#d4d4d4]"
                                }`}>
                                {highlightLine(line, ext)}
                            </code>
                        </div>
                    ))}
                </pre>
            </div>
        </div>
    );
}

// Basic syntax highlighting
function highlightLine(line: string, ext: string): React.ReactNode {
    if (!line.trim()) return " ";

    // Keywords
    const keywords = ["import", "export", "from", "const", "let", "var", "function", "return", "if", "else", "async", "await", "default", "interface", "type", "extends", "implements", "class", "new", "this", "try", "catch", "throw"];
    const jsxKeywords = ["useState", "useEffect", "useMemo", "useCallback", "useRef"];

    let result = line;

    // Highlight strings
    result = result.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="text-[#ce9178]">$&</span>');

    // Highlight comments
    if (line.trim().startsWith("//")) {
        return <span className="text-[#6a9955]">{line}</span>;
    }

    // Highlight keywords
    keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        result = result.replace(regex, `<span class="text-[#c586c0]">${kw}</span>`);
    });

    // Highlight JSX keywords
    jsxKeywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        result = result.replace(regex, `<span class="text-[#dcdcaa]">${kw}</span>`);
    });

    // Highlight JSX tags
    result = result.replace(/(&lt;\/?)([A-Z][a-zA-Z]*)/g, '$1<span class="text-[#4ec9b0]">$2</span>');
    result = result.replace(/<(\/?[a-z][a-zA-Z]*)/g, '<<span class="text-[#569cd6]">$1</span>');

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
}
