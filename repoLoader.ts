import { execSync } from 'child_process';
import * as path from 'path';

export interface RepoInfo {
    branches: string[];
    latestCommit: string;
    authors: string[];
}

export function isGitRepo(repoPath: string): boolean {
    try {
        execSync('git status', { cwd: repoPath, stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

export function loadGitRepoInfo(repoPath: string): RepoInfo | null {
    if (!isGitRepo(repoPath)) return null;

    const branches = execSync('git branch --list', { cwd: repoPath })
        .toString().split('\n').map(b => b.replace('*', '').trim()).filter(Boolean);

    const latestCommit = execSync('git log -1 --pretty=format:"%H %s"', { cwd: repoPath })
        .toString().trim();

    const authors = execSync('git log --format="%an"', { cwd: repoPath })
        .toString().split('\n').filter(Boolean);

    return {
        branches,
        latestCommit,
        authors: Array.from(new Set(authors))
    };
}
