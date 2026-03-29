export interface StartupIdea {
    id: string;
    title: string;
    description: string;
    status: StartupStatus;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}

export type StartupStatus =
    | "queued"
    | "validating"
    | "validation_review"
    | "planning"
    | "planning_review"
    | "tech_design"
    | "tech_review"
    | "business_strategy"
    | "developing"
    | "developer_review"
    | "completed"
    | "paused"
    | "rejected";

export interface QueuedIdea {
    idea: StartupIdea;
    priorityScore: number;
}

export class PriorityQueue {
    private queue: QueuedIdea[] = [];

    enqueue(idea: StartupIdea, priorityScore: number = 50): void {
        const queuedIdea: QueuedIdea = { idea, priorityScore };

        // Insert in priority order (higher priority first)
        const insertIndex = this.queue.findIndex(
            (item) => item.priorityScore < priorityScore
        );

        if (insertIndex === -1) {
            this.queue.push(queuedIdea);
        } else {
            this.queue.splice(insertIndex, 0, queuedIdea);
        }
    }

    dequeue(): StartupIdea | undefined {
        const item = this.queue.shift();
        return item?.idea;
    }

    peek(): StartupIdea | undefined {
        return this.queue[0]?.idea;
    }

    updatePriority(ideaId: string, newPriority: number): boolean {
        const index = this.queue.findIndex((item) => item.idea.id === ideaId);
        if (index === -1) return false;

        const item = this.queue.splice(index, 1)[0];
        this.enqueue(item.idea, newPriority);
        return true;
    }

    remove(ideaId: string): boolean {
        const index = this.queue.findIndex((item) => item.idea.id === ideaId);
        if (index === -1) return false;

        this.queue.splice(index, 1);
        return true;
    }

    getAll(): QueuedIdea[] {
        return [...this.queue];
    }

    size(): number {
        return this.queue.length;
    }

    isEmpty(): boolean {
        return this.queue.length === 0;
    }
}

// Calculate priority score based on various factors
export function calculatePriorityScore(
    idea: StartupIdea,
    validationScore?: number,
    userPriorityHint?: number
): number {
    let score = 50; // Base score

    // User hint weighs heavily (0-100 scale, contributes up to 40 points)
    if (userPriorityHint !== undefined) {
        score += (userPriorityHint / 100) * 40 - 20;
    }

    // Validation score contributes up to 30 points
    if (validationScore !== undefined) {
        score += (validationScore / 10) * 30 - 15;
    }

    // Older ideas get slight priority boost (up to 10 points for ideas > 7 days old)
    const ageInDays = (Date.now() - idea.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.min(ageInDays, 7) * (10 / 7);

    return Math.max(0, Math.min(100, score));
}
