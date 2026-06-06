/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleId = 
  | 'software_engineer'
  | 'frontend_developer'
  | 'full_stack_developer'
  | 'data_scientist'
  | 'product_manager'
  | 'devops_engineer';

export interface RoleInfo {
  id: RoleId;
  title: string;
  description: string;
  tags: string[];
}

export interface QuestionData {
  number: number;
  questionText: string;
  userAnswer?: string;
  feedback?: string;
  score?: number;
}

export interface InterviewSession {
  roleId: RoleId;
  questions: QuestionData[];
  currentIndex: number;
  overallFeedback?: string;
  isCompleted: boolean;
}

export const ROLES: RoleInfo[] = [
  {
    id: 'software_engineer',
    title: 'Software Engineer',
    description: 'General system design, algorithms, coding standards, and backend architectures.',
    tags: ['Algorithms', 'System Design', 'Backend'],
  },
  {
    id: 'frontend_developer',
    title: 'Frontend Developer',
    description: 'React, web performance, CSS layouts, state management, and user experience.',
    tags: ['React', 'CSS', 'JavaScript', 'Web Performance'],
  },
  {
    id: 'full_stack_developer',
    title: 'Full Stack Developer',
    description: 'E2E architecture, APIs, client-server performance, databases, and full systems integration.',
    tags: ['Full Stack', 'API Design', 'Client-Server'],
  },
  {
    id: 'data_scientist',
    title: 'Data Scientist',
    description: 'Machine learning algorithms, statistics, exploratory data analysis, and SQL query modeling.',
    tags: ['Statistics', 'ML Models', 'SQL', 'Data Analysis'],
  },
  {
    id: 'product_manager',
    title: 'Product Manager',
    description: 'Product strategy, requirement prioritisation, metrics, agile processes, and customer journey maps.',
    tags: ['Strategy', 'Metrics', 'Prioritization', 'Leadership'],
  },
  {
    id: 'devops_engineer',
    title: 'DevOps Engineer',
    description: 'CI/CD pipelines, container orchestration, AWS/GCP architecture, monitoring, and infrastructure-as-code.',
    tags: ['CI/CD', 'Docker/K8s', 'Cloud', 'Infrastructure'],
  },
];
