import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";

interface ExportRequest {
    projectName: string;
    files: Record<string, string>;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as ExportRequest;
        const { projectName, files } = body;

        if (!projectName || !files) {
            return NextResponse.json(
                { error: "projectName and files are required" },
                { status: 400 }
            );
        }

        // Create output directory in the workspace
        const baseDir = process.cwd();
        const outputDir = path.join(baseDir, "generated", projectName);

        // Create the output directory
        await fs.mkdir(outputDir, { recursive: true });

        const createdFiles: string[] = [];
        const errors: string[] = [];

        // Write each file
        for (const [filePath, content] of Object.entries(files)) {
            try {
                const fullPath = path.join(outputDir, filePath);
                const fileDir = path.dirname(fullPath);

                // Create directory structure
                await fs.mkdir(fileDir, { recursive: true });

                // Write the file
                await fs.writeFile(fullPath, content, "utf-8");
                createdFiles.push(filePath);
            } catch (err) {
                errors.push(`Failed to write ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
            }
        }

        // Create a package.json if it doesn't exist
        const packageJsonPath = path.join(outputDir, "package.json");
        try {
            await fs.access(packageJsonPath);
        } catch {
            // Create a basic package.json
            const packageJson = {
                name: projectName,
                version: "0.1.0",
                private: true,
                scripts: {
                    dev: "next dev",
                    build: "next build",
                    start: "next start",
                    lint: "next lint",
                },
                dependencies: {
                    next: "^14.0.0",
                    react: "^18.2.0",
                    "react-dom": "^18.2.0",
                },
                devDependencies: {
                    "@types/node": "^20.0.0",
                    "@types/react": "^18.2.0",
                    "@types/react-dom": "^18.2.0",
                    typescript: "^5.0.0",
                },
            };
            await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");
            createdFiles.push("package.json");
        }

        return NextResponse.json({
            success: true,
            outputDir,
            createdFiles,
            errors,
            message: `Created ${createdFiles.length} files in ${outputDir}`,
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Export failed" },
            { status: 500 }
        );
    }
}
